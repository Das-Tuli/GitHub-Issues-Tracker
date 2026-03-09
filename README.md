 Answers to Questions

### 1️⃣ What is the difference between var, let, and const?
- **`var`**: Function-scoped or globally-scoped. Can be redeclared and updated within its scope. It is hoisted to the top of its scope and initialized with `undefined`.
- **`let`**: Block-scoped (limited to the block it is declared in like `{ ... }`). Can be updated but not redeclared in the same scope. It is hoisted but not initialized, leading to a "Temporal Dead Zone".
- **`const`**: Block-scoped. Cannot be updated or redeclared. It must be initialized at the time of declaration. Note that for objects and arrays defined with `const`, the reference cannot be changed, but their internal properties/elements can still be mutated/modified.

### 2️⃣ What is the spread operator (...)?
The **spread operator (`...`)** allows an iterable (such as an array or string) to be expanded in places where zero or more arguments or elements are expected, or an object expression to be expanded in places where zero or more key-value pairs are expected. 
- In arrays: `[...arr1, ...arr2]` merges two arrays.
- In objects: `{...obj1, ...obj2}` merges two objects.
- In function calls: `func(...arr)` passes array elements as individual arguments to the function.

### 3️⃣ What is the difference between map(), filter(), and forEach()?
- **`map()`**: Iterates over an array and returns a **new array** of the same length, where each element is the result of applying a callback function to the original element. Use when you want to transform elements.
- **`filter()`**: Iterates over an array and returns a **new array** containing only the elements that pass a given condition inside the callback function. Use when you want to extract a subset of data.
- **`forEach()`**: Iterates over an array and runs a callback function for each element but **does not return anything** (returns `undefined`). Use when you just want to execute a side effect (like logging or updating the DOM) for each item.

### 4️⃣ What is an arrow function?
An **arrow function** (`() => {}`) is a shorter syntax for writing function expressions in JavaScript. It doesn't have its own binding to `this` (it inherently binds `this` lexically from the surrounding scope closure), and it cannot be used as a constructor.
Example: `const add = (a, b) => a + b;`

### 5️⃣ What are template literals?
**Template literals** are enclosed by backticks (`` ` ``) instead of quotes and allow for easier string formatting. They can contain placeholders for embedded JavaScript expressions using the `${expression}` syntax. It makes string interpolation and multi-line strings much cleaner compared to normal strings with `+` concatenation.
Example: `` const message = `Hello, ${name}!`; ``
