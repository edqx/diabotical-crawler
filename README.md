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

### Start
Now you can start the program with `node index`

## Options
You can pass command line arguments to the program to change it's behaviour.
* `--threads <threads>` - Set the number of threads that the program can use. (Default 3)
* `--disable-output` - Completely disable all console output.

### Examples
`node index`
`node index --threads 6`
`node index --disable-output`
`node index --threads 1 --disable-output`

### Notes
I am not responsible for any consequences that may come from you using this program.