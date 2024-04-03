# Aelastics  Monorepo

This mono repository contains an open-source framework called AelasticS.

## Aelastics Framework  

Aelastics is a functional TypeScript framework  designed to facilitate various data processing.


This framework comprises three main packages:

1. **aelastics-types**: This package enables the definition of various dynamic data types at runtime, including simple and composite types such as objects, arrays, unions, etc., along with constraints upon their values. It also supports the creation of complex data schemas that describe data structures based on these defined types, which can include intricate structures like cyclic graph data structures. 

    Furthermore, it facilitates annotations, allowing developers to enrich data definitions with relevant metadata. 
    
    Additionally, it provides generic traversal algorithms for efficiently navigating and manipulating data structures that adhere to these schemas. Implemented functionalities include data validation and serialization, among others.

2. **aelastics-store**: The package provides components for implementing immutable application states. 

    Immutability plays a critical role in guaranteeing predictable state management and streamlining the debugging process, while also aiding in the comprehension of application behavior.

3. **aelastics/synthesis**: This packaged implemnts a domain-specific language (DSL), which facilitates data structure transformations based on flexible rules. 

    By leveraging this DSL, developers can express transformation logic concisely and efficiently, enabling them to manipulate data structures according to specific requirements or business rules.


## Getting Started

Welcome to our open-source monorepo managed with Rush.js! This guide will help you get up and running with our project quickly.

### Prerequisites

Before you begin, ensure you have the following prerequisites installed:

- Node.js (version 20.11.1 or higher)
- npm (version 10.2.4 or higher)
- Rush.js (version 5.113.0 or higher)

### Installation

1. Fork the repository to your GitHub account.

2. Clone the forked repository to your local machine:
   ```bash
   git clone https://github.com/AelasticS/aelastics.git
3. Navigate to the repository directory
    ```bash
    cd aelastics
4. Install Rush.js globally if you haven't already:
    ```bash
    npm install -g @microsoft/rush
5. Install Rush.js dependencies for the first time:
    ```bash
    rush update
6. Build the framework:
    ```bash
    rush build

Once you have set up the repository, you can start contributing to our project. 

### Contributing
We welcome contributions from the community! 

To contribute to our project, please please read [GENERAL-CONTRIBUTING](GENERAL-CONTRIBUTING.md).


### Additional Resources
For more detailed documentation and advanced usage of Rush.js, refer to [the official documentation.](https://rushjs.io/)

