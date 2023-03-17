# Brightcove - cue point markers plugin

A Brightcove player plugin that adds cue point markers and associated metadata dynamically to the player progress bar.
The plugn prioritises the cue metadata form Video Cloud over the "chapter" metadata associated with the video object.\
Unlike other implementations of chaptering there is no need for the admin to add an index or marker at 00:00 of the video.\
\
This implementation has been tested against player version 7.2 and 6.67. Browser testing has been mild but Firefox 110.0.1, Chrome 111.0.5563.64 and Safari 16.3.\
\
What remains untested: The running of this plugin alongside the IMA plugin needs more thorugh testing in the context of Server Side Ad Insertion and Client Side Ad Insertion where chapters are used to trigger mid-roll video ads.

### Behaviours

* This plugin works with a [playlist enabled player](https://studio.support.brightcove.com/get-started/basics/video-cloud-basics-creating-playlist-player.html)
* Tooltips with chapter description appear alongside the chapter marker when hovered over on the player control bar
* Ad based cue points are ignored
* The colour of the cue markers can be defined in the Video Cloud player module as a JSON option
* Once chapters have been added the change will be detected by all deployed Brightcove players that have this plugin installed

### Usage

To have the chapers appear on the time player progress bar this plugin must be installed on a designated player.
Chapters can be pasted into the [long description field](https://studio.support.brightcove.com/media/properties/editing-video-properties-using-media-module.html#videoinfo) in the media module or the [add code cue points using the cue points UI](https://studio.support.brightcove.com/media/general/working-cue-points-media-module.html).

00:10 - Intro\
01:04 - Pricing and features\
03:14 - Practicality\
05:44 - Under the bonnet\
06:51 - Driving\
11:04 - Efficiency\
11:21 - Safety\
11:46 - Ownership\
12:20 - Verdict

```json
    {
        "cue_marker_color": "#FFF"
    }
```
