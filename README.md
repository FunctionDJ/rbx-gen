# This repository is deprecated. VirtualDJ now has a native CDJ-Export feature.
## Feature demo video: https://youtu.be/bb37Pt-rdDo
## VDJ Manual: https://virtualdj.com/manuals/virtualdj/interface/database/cdjexport/index.html


# rbx-gen
(name not final, duh)

This is a tool that can (currently) convert VirtualDJ playlists (the 'Playlists' folder and all .m3u and .m3u8 playlist files inside favorited folders, no matter how nested) to Rekordbox.
It does this by creating a rekordbox.xml file which you can import in Rekordbox 5.6 normally or in newer versions like Rekordbox 6 with this little additional workaround until Pioneer DJ fixes this bug: https://youtu.be/wEYVvC1S7ro

Because this tool just goes to every drive, looks for the favorite folders inside the Drive:/VirtualDJ/ folder, you can easily turn this code into a general .m3u playlist to Rekordbox converter.
It's a shame that Rekordbox doesn't have a user-friendly method of importing m3u playlists.

To run this tool, run `npm install` and then `npx ts-node src/main.ts`. If you don't know what this means, this tool is not for you at this stage of development!
I hope i can make it more user friendly at some point, but right now i'm more concerned about functionality.

This tool is already able to generate an XML file that the most recent Rekordbox 6 will accept and import with the exception of missing / moved files, which are just chugged into the XML and not handled any further by this code.

The main missing feature is looking up any track inside the VirtualDJ database and fetching it's cue points and maybe the BPM and such. The model for the Rekordbox hot cues and loops already exists in the code but is untested.

In the long run, other developers should be able to add MacOS support and expand it for Serato and other DJ software (Traktor lol).

I think every DJ should be allowed to use CDJs with a USB stick without having to permanently move to Rekordbox, which is the situation i'm facing and trying to solve with this software.

If you wanna get in touch with me fast: waffeln#5603 on Discord, or join the VirtualDJ server: https://discord.gg/v4RvzGS
