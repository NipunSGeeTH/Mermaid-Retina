export type DiagramTemplate = {
  id: string;
  name: string;
  description: string;
  code: string;
};

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: "flow-basic",
    name: "Flowchart",
    description: "Simple process flow with decision branch.",
    code: `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug it]
  D --> A`,
  },
  {
    id: "sequence-api",
    name: "Sequence API",
    description: "Client, API, and DB interaction.",
    code: `sequenceDiagram
  participant U as User
  participant C as Client
  participant A as API
  participant D as Database
  U->>C: Submit form
  C->>A: POST /items
  A->>D: Insert row
  D-->>A: OK
  A-->>C: 201 Created
  C-->>U: Success message`,
  },
  {
    id: "class-domain",
    name: "Class Model",
    description: "Basic domain model with relations.",
    code: `classDiagram
  class User {
    +id: UUID
    +name: string
    +email: string
  }
  class Project {
    +id: UUID
    +title: string
  }
  class Task {
    +id: UUID
    +status: string
  }
  User "1" --> "*" Project
  Project "1" --> "*" Task`,
  },
  {
    id: "gantt-roadmap",
    name: "Gantt Plan",
    description: "Roadmap timeline for releases.",
    code: `gantt
  title Product Roadmap
  dateFormat  YYYY-MM-DD
  section Foundation
  Setup project          :done, a1, 2026-04-01, 5d
  Build core editor      :active, a2, 2026-04-07, 8d
  section Growth
  Add collaboration      :a3, after a2, 7d
  Public launch          :a4, after a3, 3d`,
  },
];

