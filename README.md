# Scramble Visualizer

- Install Tampermonkey
    - Open Tampermonkey in Chrome's extension manager and "allow file access"
- Set up Tampermonkey
    - Setting mode: Advanced
    - Assert that "Allow scripts to access local files" is "Externals (@require and @resource)"
- Create new script
    - Replace the generated file's header with that of `main.js`
    - Add `@require: /clone/destination/main.js` header
