#!/usr/bin/env node

"use strict";

import '../tools/exit.cjs'
import fs from 'fs'
import path from 'path'
import program from 'commander'

import { _run_cli as run_cli } from '../main.js'

const packageJson = {
    name: 'terser',
    version: 'development-cli'
}
run_cli({ program, packageJson, fs, path }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
