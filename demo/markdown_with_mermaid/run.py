import gradio as gr

demo = gr.Blocks()

with demo:
    gr.Markdown(
        """
        # Project Documentation with Mermaid Diagrams
        
        This example demonstrates how to combine regular Markdown with Mermaid diagrams for better visualization.
        
        ## System Architecture
        
        Below is an overview of our system's architecture:
        
        ```mermaid
        graph LR
            User[User] --> Frontend[Web Frontend]
            Frontend --> API[API Gateway]
            API --> Auth[Authentication Service]
            API --> DataService[Data Processing Service]
            DataService --> DB[(Database)]
            DataService --> ML[Machine Learning Engine]
            ML --> Model[(Model Storage)]
            
            style User fill:#f9f,stroke:#333,stroke-width:2px
            style Frontend fill:#bbf,stroke:#333,stroke-width:2px
            style API fill:#bfb,stroke:#333,stroke-width:2px
            style DataService fill:#fbb,stroke:#333,stroke-width:2px
        ```
        
        ## Data Processing Workflow
        
        The data goes through the following steps before reaching the end user:
        
        1. Collection from various sources
        2. Cleaning and preprocessing
        3. Feature extraction
        4. Analysis and model application
        5. Results formatting
        
        ## User Journey
        
        ```mermaid
        sequenceDiagram
            participant U as User
            participant F as Frontend
            participant A as API
            participant D as Database
            
            U->>F: Login Request
            F->>A: Authenticate
            A->>D: Verify Credentials
            D-->>A: User Validated
            A-->>F: Auth Token
            F-->>U: Login Success
            
            U->>F: Request Data
            F->>A: Get Data (with token)
            A->>D: Query Data
            D-->>A: Return Results
            A-->>F: Formatted Data
            F-->>U: Display Results
        ```
        
        ## Decision Process
        
        When handling requests, our system follows this decision tree:
        
        ```mermaid
        flowchart TD
            A[New Request] --> B{Authenticated?}
            B -->|Yes| C{Request Type}
            B -->|No| D[Return 401]
            
            C -->|Data Query| E[Process Query]
            C -->|Update| F{Has Permission?}
            C -->|Delete| G{Is Admin?}
            
            F -->|Yes| H[Apply Update]
            F -->|No| I[Return 403]
            
            G -->|Yes| J[Execute Delete]
            G -->|No| K[Return 403]
            
            E --> L[Return Data]
            H --> M[Return Success]
            J --> N[Return Success]
            
            style A fill:#98fb98,stroke:#333
            style D fill:#ff9999,stroke:#333
            style I fill:#ff9999,stroke:#333
            style K fill:#ff9999,stroke:#333
            style M fill:#98fb98,stroke:#333
            style N fill:#98fb98,stroke:#333
        ```
        
        ## State Diagram
        
        Our application transitions through these states:
        
        ```mermaid
        stateDiagram-v2
            [*] --> Initialization
            Initialization --> Ready
            
            Ready --> Processing: New Request
            Processing --> Error: Exception
            Processing --> Complete: Success
            
            Error --> Ready: Reset
            Complete --> Ready: Reset
            
            Ready --> Shutdown: Exit Command
            Shutdown --> [*]
        ```
        
        ## Additional Resources
        
        For more information about our system, please check:
        
        - [API Documentation](https://example.com/api-docs)
        - [User Guide](https://example.com/user-guide)
        - [Admin Dashboard](https://example.com/admin)
        """
    )

if __name__ == "__main__":
    demo.launch()
