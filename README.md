# Diabotical Crawler

## Installation
### Prerequisites
* [Node.js](https://nodejs.org)
* [NPM](https://npmjs.org) (Comes with node)
* [Git](https://git-scm.org)
* A command prompt of your choice
* A text editor of your choice

### Clone repository
Clone the repository locally with `git clone https://github.com/edqx/diabotical-crawler.git`, this will take a few seconds.

### Install packages
Next use `cd diabotical-crawler` to enter the diabotical crawler directory.

### Setup
The program will not run without any users or matches in the _stack_. You can create a base stack for the program to work from by creating a file named `stack.json` and using any of the following templates, replacing <userid> with your user ID and <matchid> with a match ID to work from.
```json
[
    {
        "op": "getmatches",
        "id": "<userid>"
    }
]
```
```json
[
    {
        "op": "getmatch",
        "id": "<matchid>"
    }
]
```
If you don't have a user ID to use, you can use mine, `5f7a86535be4402f8c0c86fc655f8275` :)

The stack should grow very quickly, although if it stops then you may have to use a different user ID or match ID as it may be too closed, i.e. it doesn't have enough branches to go to to reach new users.

### Start
Now you can start the program with `node index`

## Options
You can pass command line arguments to the program to change it's behaviour.
* `--threads <threads>` - Set the number of threads that the program can use. (Default 3)
* `--disable-output` - Completely disable all console output.
* `--collect-profiles` - Collect profiles of users. (Will slow down crawler)

### Examples
* `node index`
* `node index --threads 6`
* `node index --disable-output`
* `node index --threads 1 --disable-output`

### Notes
I am not responsible for any consequences that may come from you using this program.