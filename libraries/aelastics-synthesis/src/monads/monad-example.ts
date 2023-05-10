declare function fetchA(cb: (a: number) => void): void;
declare function fetchB(a: number, cb: (b: number) => void): void;
declare function fetchC(b: number, cb: (b: number) => void): void;
declare function fetchD(c: number, cb: (b: number) => void): void;

// callback hell
function getD(cb: (sum: number) => void): void {
    fetchA((a) => {
      fetchB(a, (b) => {
        fetchC(b, (c) => {
          fetchD(c, (d) => {
            cb(d);
          });
        });
      });
    });
  }


declare function fetchA(): Promise<number>;
declare function fetchB(a: number): Promise<number>;
declare function fetchC(b: number): Promise<number>;
declare function fetchD(c: number): Promise<number>;


// Promise based solution
function getDT(): Promise<number> {
  return fetchA()
    .then((a) => fetchB(a))
    .then((b) => fetchC(b))
    .then((c) => fetchD(c));
}


async function getD_Await(): Promise<number> {
    const a = await fetchA();
    const b = await fetchB(a);
    const c = await fetchC(b);
    return await fetchD(c);
  }

declare function fetchA(): Promise<number>;
declare function fetchB(a: number): Promise<number>;
declare function fetchC(a: number, b: number): Promise<number>;
declare function fetchD(a: number, b: number, c: number): Promise<number>;

// callback hell 
function sumAbcd(): Promise<number> {
  return fetchA()
    .then((a) => fetchB(a)
      .then((b) => fetchC(a, b)
        .then((c) => fetchD(a, b, c)
          .then((d) => {
            return a + b + c + d;
          })
        )
      )
    );
}

async function sumAbcd_Await(): Promise<number> {
    const a = await fetchA();
    const b = await fetchB(a);
    const c = await fetchC(a,b);
    const d = await fetchD(a,b,c);
    return a + b + c + d;
}