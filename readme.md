### Dependencies

You need [Deno](https://deno.land) available in your environment. Follow the [installation guide](https://deno.land/#installation) if you need it.

### Usage

Clone this repository and run it:

```
$ git clone https://github.com/sgmonda/webot.git
$ cd webot
$ deno run -Ar --unstable mod.ts           # Note: Add "--headless" not to show browser
```

**Note**: it is possible an error related with browser binary is thrown, in case there is no one installed. To solve it:

```
$ PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.1/install.ts
```
