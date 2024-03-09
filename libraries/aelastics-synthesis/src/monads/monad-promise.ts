
type Monad<A> = Promise<A>;

function of<A>(a: A): Monad<A> {
  return Promise.resolve(a);
}

function flatMap<A, B>(monad: Monad<A>, cb: (a: A) => Monad<B>): Monad<B> {
  return monad.then(cb);
}


// Given
type A = number
type B = string
type C = boolean

declare const a: A;
declare function f(a: A): Monad<B>;

//The left identity law says that whenever you put a value inside a monad with of 
// and access that value again by passing a callback to flatMap, 
// then you will have the same value available in the callback again. 
flatMap(of(a), a => f(a)) === f(a);
// === means here that both parts are equivalent
// what equality means can be defined by the monad


declare const monad: Monad<A>;
// The right identity law says that whenever you access the value of a Monad using flatMap, 
// and then put that value in a Monad again with of, 
// you will have back the same Monad.
flatMap(monad, a => of(a)) === monad


// Given
declare function f(a: A): Monad<B>;
declare function g(b: B): Monad<C>;
  
// The final monad law says that when we have a chain of 
// monadic function applications with flatMap,
// it shouldn’t matter how they’re nested. 
flatMap(flatMap(monad, f), g) === flatMap(monad, (a) => flatMap(f(a), g))