import re
from dataclasses import dataclass
from typing import List, Tuple
from transformers import AutoTokenizer

@dataclass
class BlogChunks:
    title: str
    content: List[str]
    type: str
    url: str 

class TextChunker:
    def __init__(self, model_name: str = "voyageai/voyage-3-large"):
        """Initialize the chunker with a tokenizer."""
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.tokenizer.encode(text))
    
    def find_chunk_boundary(self, text: str, target_tokens: int, overlap_tokens: int) -> Tuple[str, str]:
        """
        Find a boundary near the target token count, breaking at sentence boundaries when possible
        but enforcing a hard limit of 100 tokens. Includes overlap in the next chunk.
        Returns a tuple of (chunk, remainder).
        """
        if not text:
            return "", ""
            
        # First try to split by sentence
        sentence_pattern = r'(?<=[.!?])\s+(?=[A-Z])'
        sentences = re.split(sentence_pattern, text)
        
        current_chunk = []
        current_tokens = 0
        overlap_start_idx = 0  # Track where to start overlap
        
        for i, sentence in enumerate(sentences):
            sentence_tokens = self.count_tokens(sentence)
            
            # If this would exceed our hard limit of 100 tokens
            if current_tokens + sentence_tokens > target_tokens:
                if not current_chunk:
                    # Need to split the sentence by words
                    words = sentence.split()
                    word_chunk = []
                    
                    for word in words:
                        word_tokens = self.count_tokens(word + ' ')
                        if current_tokens + word_tokens > target_tokens:
                            break
                        word_chunk.append(word)
                        current_tokens += word_tokens
                    
                    if not word_chunk:  # If even a single word is too long
                        return sentence[:target_tokens], sentence[target_tokens:]
                    
                    chunk_text = ' '.join(word_chunk)
                    # Include some of the end of this chunk in the next chunk for overlap
                    overlap_point = max(0, len(word_chunk) - int(len(word_chunk) * 0.5))
                    remainder = ' '.join(words[overlap_point:])
                    if i < len(sentences) - 1:
                        remainder += ' ' + ' '.join(sentences[i+1:])
                    return chunk_text, remainder.strip()
                
                chunk_text = ' '.join(current_chunk)
                # Start the next chunk from roughly halfway through this one for overlap
                overlap_start_idx = max(0, i - len(current_chunk) // 2)
                remainder = ' '.join(sentences[overlap_start_idx:])
                return chunk_text, remainder.strip()
            
            # If we would exceed the target token count (but not hard limit)
            if current_tokens + sentence_tokens > target_tokens and current_chunk:
                chunk_text = ' '.join(current_chunk)
                # Start the next chunk from roughly halfway through this one for overlap
                overlap_start_idx = max(0, i - len(current_chunk) // 2)
                remainder = ' '.join(sentences[overlap_start_idx:])
                return chunk_text, remainder.strip()
            
            current_chunk.append(sentence)
            current_tokens += sentence_tokens
        
        # If we get here, return the entire text as one chunk
        return ' '.join(current_chunk), ''

    def chunk_page(
        self,
        title: str,
        url: str,
        content: str,
        type: str,
        target_length: int = 100,  # Token counts for different chunk sizes
        overlap_percentage: float = 0.5  # 20% overlap by default
    ) -> BlogChunks:
        """
        Chunks document content with specified overlap percentage and multiple target lengths.
        Returns a dictionary mapping target length to list of chunks.
        """
        # Clean the content first
        content = self._clean_content(content)
        
        # Dictionary to store chunks for each target length
        chunks = BlogChunks(
            title=title,
            content=[],
            type=type,
            url=url
        )
        
        overlap_tokens = int(target_length * overlap_percentage)
        remaining_text = content
        current_section = None
        
        while remaining_text:
            # Handle section headers
            if remaining_text.lstrip().startswith('#'):
                section_end = remaining_text.find('\n')
                if section_end == -1:
                    break
                current_section = remaining_text[:section_end].lstrip('#').strip()
                remaining_text = remaining_text[section_end:].strip()
                continue
            
            # Find natural break point
            chunk_text, remaining_text = self.find_chunk_boundary(
                remaining_text, 
                target_length,
                overlap_tokens
            )
            
            if chunk_text:
                chunks.content.append(chunk_text)
            
            if not remaining_text:
                break
        for i, chunk in enumerate(chunks.content):
            if "Demos" in chunk and "demo.launch()" in chunk:
                chunks.content[i] = chunk.split("Demos")[0] + chunk.split("demo.launch()")[1]
            if "Open in" in chunk and "demo.launch()" in chunk:
                chunks.content.pop(i)

        print(f"\nChunked: {title}")
        # print(f"\n\n\n{'*'*50}")
        # print(f"Target Length: {target_length}")
        # print(f"\n{'*'*50}")
        # print(f"{'='*50}")
        # for chunk in all_chunks:
        #     print(f"Length: {self.count_tokens(chunk.content)} tokens")
        #     print(f"Content: {chunk.content}")
        #     print(f"{'='*50}")  
        # print(f"\n\n\n{'*'*50}") 
        # print([chunk.content for chunk in all_chunks])
        
        return chunks
    
    def _clean_content(self, content: str) -> str:
        """Clean the content by removing code blocks and markdown links."""        
        # Remove triple backtick code blocks with optional language
        content = re.sub(r'```(?:[a-zA-Z]*\s*)?[\s\S]*?```', '', content)

        content = re.sub(r'`{1,2}\w*\n[\s\S]*?(?:`{1,2})', '', content)
        
        # Remove any remaining single or double backtick blocks
        content = re.sub(r'``[^`]*(?:`[^`]+`)*[^`]*``', '', content)  # Double backticks
        content = re.sub(r'`[^`]*`', '', content)  # Single backticks
        
        # Remove markdown links but keep text
        content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', content)
        
        # Replace common HTML entities with their readable equivalents
        html_entities = {
            '&quot;': '"',
            '&apos;': "'",
            '&#039;': "'",
            '&lt;': '<',
            '&gt;': '>',
            '&amp;': '&',
            '&ndash;': '-',
            '&mdash;': '--',
            '&nbsp;': ' ',
            '&rsquo;': "'",
            '&lsquo;': "'",
            '&rdquo;': '"',
            '&ldquo;': '"',
            '&#8217;': "'",
            '&#8216;': "'",
            '&#8221;': '"',
            '&#8220;': '"',
            '&hellip;': '...',
            '&#x27;': "'",
            '&bull;': '•',
            '&middot;': '·',
            '&#8226;': '•'
        }
        
        for entity, replacement in html_entities.items():
            content = content.replace(entity, replacement)
            
        # Also handle numeric entities like &#34; (double quote)
        content = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))), content)
        
        # Handle hex entities like &#x22;
        content = re.sub(r'&#x([0-9a-fA-F]+);', lambda m: chr(int(m.group(1), 16)), content)
        
        # Normalize whitespace (including handling of newlines)
        content = re.sub(r'\s+', ' ', content)
        
        return content.strip()
    