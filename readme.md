Run the program:

```
$ deno run -Ar --unstable mod.ts
```

**Note**: it is possible an error related with browser binary is thrown, in case there is no one installed. To solve it:

```
$ PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.1/install.ts
```