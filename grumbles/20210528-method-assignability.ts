type Animal = { species: string };
type Cat = { species: "cat" };
type Dog = { species: "dog" };

function test1(
  animal: Animal,
  cat: Cat,
) {
  // A cat is an animal, so assignment is ok
  animal = cat;

  // But an animal is not a cat, so you can't do the reverse assignment
  cat = animal; // Error
}

type Box<T> = { value: T };

function test2(
  boxedAnimal: Box<Animal>,
  boxedCat: Box<Cat>,
) {
  // The same logic applies when containing another type
  boxedAnimal = boxedCat;
  boxedCat = boxedAnimal; // Error
}

type Doctor<T> = {
  treat: (patient: T) => void;
};

function test3(
  animalDoctor: Doctor<Animal>,
  catDoctor: Doctor<Cat>,
) {
  // When accepting a type as a parameter, the allowed assignment direction is
  // reversed. A cat doctor cannot treat animals, but an animal doctor can treat
  // cats.
  animalDoctor = catDoctor; // Error
  catDoctor = animalDoctor;
}

type MethodDoctor<T> = {
  treat(patient: T): void;
}

function test4(
  animalDoctor: MethodDoctor<Animal>,
  catDoctor: MethodDoctor<Cat>
) {
  // However, if you use a *method* instead of a function, TypeScript pretends
  // this is ok!
  animalDoctor = catDoctor; // Not an error!
  catDoctor = animalDoctor;
}

function test5(
  catDoctor: MethodDoctor<Cat>,
  dog: Dog,
) {
  // To clarify the above, it's easy to understand why the line below is an
  // error - a cat doctor isn't trained to treat a dog.
  catDoctor.treat(dog); // Error

  // But by allowing this assignment, TypeScript is allowing the cat doctor to
  // be an animal doctor.
  const animalDoctor: MethodDoctor<Animal> = catDoctor;

  // Which means the cat doctor is now allowed to treat the dog, because the
  // dog is an animal. This is nonsense.
  animalDoctor.treat(dog);
}

function test6(dog: Dog) {
  // It's my understanding that the rationalization of this is deep in
  // TypeScript's DNA. TypeScript seeks to be helpful more than it seeks to be
  // correct.

  const cats: Cat[] = [];

  // Arrays are considered a motivating example. Cats are animals, right?
  const animals: Animal[] = cats; // Right?

  // But we have the same problem as above:
  animals.push(dog);

  console.log(cats[0].species); // "dog"!

  // I think this boils down to allowing a broader type than necessary. This is
  // extremely common because of the combinatorial complexity of all the subsets
  // of types being used in specific places.
  //
  // For example, it's easier to write:
  //   function surprise(dog: Dog) { dog.bark(); }
  // than:
  //   function surprise(barker: { bark(): unknown }) { barker.bark(); }
  //
  // It's also often good for API stability to accept a broader type, since
  // a change to use more of that type is a non-breaking change. There's a
  // parallel issue here though - any change to an API might break things. It's
  // only non-breaking in the sense that the type checker will allow it, but if
  // the type checker could have detected the break, maybe it's better to
  // empower it to do so.
}

function test7() {
  // It's a tradeoff. I would like to see a fork of TypeScript which trades away
  // these conveniences of inaccuracy to make its type system correct. The
  // JavaScript runtime is amazing and it's everywhere. Let's make writing
  // correct JavaScript easier.
  //
  // In the meantime, if you want a generic type which enforces strict
  // assignment rules on its type parameter, this can be achieved by including
  // an echo function:
  type StrictBox<T> = {
    value: T, // This helps restrict assignment but it is not needed
    echo: (x: T) => T,
  };

  function test7a(boxedAnimal: StrictBox<Animal>, boxedCat: StrictBox<Cat>) {
    boxedAnimal = boxedCat; // Error
    boxedCat = boxedAnimal; // Error
  }

  // Just don't forget that echo needs to be a *function*, not a method:
  type OopsBox<T> = {
    value: T,
    echo(x: T): T, // <-- This behaves differently! 😱
  }

  function test7b(boxedAnimal: OopsBox<Animal>, boxedCat: OopsBox<Cat>) {
    boxedAnimal = boxedCat; // Not an error!
    boxedCat = boxedAnimal; // Error
  }
}
