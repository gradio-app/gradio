import os
import json 
import re
from dataclasses import dataclass

@dataclass
class BlogChunk:
    title: str
    content: str
    type: str
    url: str 

def chunk_page(title: str, url: str, content: str, type: str, target_length: int = 250) -> list[BlogChunk]:
    """
    Chunks document content into segments optimized for natural language comparison.
    Tries to break at paragraph or sentence boundaries near the target length.
    """
    # Split into paragraphs first
    paragraphs = [p.strip() for p in content.split('\n') if p.strip()]
    
    chunks = []
    current_chunk = []
    current_length = 0
    current_section = None

    print(f"Processing document: {title}")

    for para in paragraphs:
        # Skip code blocks
        if para.startswith('`') or para.startswith('```'):
            continue
            
        # Check if this is a heading/title
        if para.startswith('#'):
            if current_chunk:
                chunks.append(BlogChunk(
                    title=title,
                    content=' '.join(current_chunk),
                    type=type,
                    url=url
                ))
            current_chunk = []
            current_length = 0
            current_section = para.lstrip('#').strip()
            continue

        # Remove any markdown links for cleaner text
        para = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', para)
        
        # Split paragraph into sentences (rough approximation)
        sentences = [s.strip() + '.' for s in para.split('.') if s.strip()]
        
        for sentence in sentences:
            if current_length + len(sentence) > target_length and current_chunk:
                # Save current chunk if it would exceed target length
                chunk_content = ' '.join(current_chunk)
                chunks.append(BlogChunk(
                    title=title,
                    content=chunk_content,
                    type=type,
                    url=url
                ))
                current_chunk = []
                current_length = 0
            
            current_chunk.append(sentence)
            current_length += len(sentence)
    
    # Add final chunk if any remains
    if current_chunk:
        chunk_content = ' '.join(current_chunk)
        chunks.append(BlogChunk(
            title=title,
            content=chunk_content,
            type=type,
            url=url
        ))
    # print("\nChunk contents:")
    # for i, chunk in enumerate(chunks, 1):
    #     print(f"\n{'='*50}")
    #     print(f"Chunk {i}:")
    #     print(f"Length: {len(chunk.content)}")
    #     print(f"Content: {chunk.content}")
    #     print(f"{'='*50}")   
    return chunks
