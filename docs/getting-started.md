---
title: Getting Started
---

# Getting Started

## Prerequisites

- Node.js 20.11.1 or higher
- npm 10.2.4 or higher
- Rush.js 5.113.0 or higher

## Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/AelasticS/aelastics.git
   cd aelastics
   ```

2. Install Rush.js globally:
   ```bash
   npm install -g @microsoft/rush
   ```

3. Install dependencies and build:
   ```bash
   rush update
   rush build
   ```

## Running Tests

```bash
# All tests
rush test

# Within a specific library
cd libraries/aelastics-types
rushx test

# Single test file
rushx test -- --testPathPattern="my-test"
```

## Contributing

See [GENERAL-CONTRIBUTING](https://github.com/AelasticS/aelastics/blob/master/GENERAL-CONTRIBUTING.md) for contribution guidelines.
