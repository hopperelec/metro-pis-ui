# Tyne and Wear Metro Class 599 PIS UI

This tool provides a user-friendly way to browse and experiment with official PIS data taken from
Freedom of Information requests made to Nexus (Tyne and Wear Transport Executive).

## Pages
- **All Audio** lists all audio including announcements, audio descriptions and chimes,
  organized by their transcription (so male and female versions of the same announcement are grouped together).
- **Audio Builder** lets you piece together any of those audio files to create your own custom announcement,
  and makes it easy to find the audio files you need to do so.
- **Routes** lets you listen to the announcements and view the on-board dot matrix
  for arriving at and departing from each station on any possible route.
- **Transcriber** was mostly just made for creating the transcriptions for this website
  (modifying the official ones, and creating missing ones),
  but I've left it in for if you want to see all the changes that were made.

## Installation
1. Clone this repository.
2. Create a file named `.env` in the repository directory
3. Either:
   - Put `PUBLIC_AUDIO_URL=https://www.hopperelec.co.uk/resources/599-announcements` in the `.env` file.
     This will make the website slower (and eat up my bandwidth!),
     but saves you from needing to download all the audio files (including ones you might not use).
   - Download all the audio files from
     [here](https://drive.google.com/drive/folders/1FbKavr6gNtCPuz4vT9g_hHcyde4L1KMG?usp=sharing)
     and put them in `/static/audio`. Then put `PUBLIC_AUDIO_URL=/audio` in the `.env` file.
4. Install pnpm if you don't have it installed already ([how?](https://pnpm.io/installation))
5. Run `pnpm install` in the repository directory from the command line.
6. If you intend on editing the code, run `pnpm dev` to start the development server.
   Then go to http://localhost:5173 in your web browser.
   The website will be slower, but you can see changes you make in real-time.
7. If you just want to use the website, run `pnpm build` to build the website (you only need to do this once),
   run `pnpm preview` to start the preview server, then go to http://localhost:4173 in your web browser.

## Sources
Audio files:
[this GitHub repository](https://github.com/Rail-Announcements/nexus-tyne-and-wear-metro).

Official transcripts, station codes, route announcements and dot matrix messages:
[this WhatDoTheyKnow FoI request](https://www.whatdotheyknow.com/request/tyne_wear_metro_automated_announ)
(specifically the file named "Master Station Index 2.xls").

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with
Tyne and Wear Transport Executive or Tyne and Wear Metro.