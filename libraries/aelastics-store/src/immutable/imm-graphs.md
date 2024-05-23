
  Cyclic graphs
  
  ```mermaid
  graph TD;
  classDef myStyle color:red background-color:transparent;;

    A((Circle A)) -->B((Circle B)); 
    A-->C((Circle C));
    B-->D((Circle D)); 
    C-->B
    D-->C

  
    
    
    A1((Circle A)) -->B1((Circle B)); 
    A1-->|X| C1((Circle C));
    B1-->|X| D1((Circle D)); 
    C1-->|<span style="color:red; background-color:transparent;">X</span>| B1;
    D1-->C1

    
  
```

some text

```mermaid
graph  
    subgraph Tree 1
        A((Circle A)) -->B((Circle B)); 
    end
    subgraph Tree 2
        D-->C
    end
    A-.->|X|C((Circle C));
    B-.->|X|D((Circle D)); 
    C-.->|X|B


