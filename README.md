# Brightcove - cue point markers plugin

A Brightcove player plugin that adds cue point markers and associated metadata dynamically to the player progress bar.
The plugn prioritises the cue metadata form Video Cloud over the "chapter" metadata associated with the video object.\
Unlike other implementations of chaptering there is no need for the admin to add an index or marker at 00:00 of the video.\
\
This implementation has been tested against player version 7.2 and 6.67. Browser testing has been mild but Firefox 110.0.1, Chrome 111.0.5563.64 and Safari 16.3.\
\
What remains untested: The running of this plugin alongside the IMA plugin needs more thorugh testing in the context of Server Side Ad Insertion and Client Side Ad Insertion where chapters are used to trigger mid-roll video ads.

### Behaviours

![video player](readme_images/video_player.gif)

* This plugin works with a [playlist enabled player](https://studio.support.brightcove.com/get-started/basics/video-cloud-basics-creating-playlist-player.html)
* Tooltips with chapter description appear alongside the chapter marker when hovered over on the player control bar
* Ad based cue points are ignored
* The colour of the cue markers can be defined in the Video Cloud player module as a JSON option
* Once chapters have been added the change will be detected by all deployed Brightcove players that have this plugin installed

### Usage

To have the chapers appear on the time player progress bar this plugin must be installed on a designated player.
Chapters can be pasted or typed into the [long description field](https://studio.support.brightcove.com/media/properties/editing-video-properties-using-media-module.html#videoinfo) in the media module or the [add code cue points using the cue points UI](https://studio.support.brightcove.com/media/general/working-cue-points-media-module.html).

![edit long description](readme_images/long_description.gif)

> **Note**\
> The following chapters are an example of what can be placed in the long description field.\
\
> 00:10 - Intro\
> 01:04 - Pricing and features\
> 03:14 - Practicality\
> 05:44 - Under the bonnet\
> 06:51 - Driving\
> 11:04 - Efficiency\
> 11:21 - Safety\
> 11:46 - Ownership\
> 12:20 - Verdict\
\
> Timestamps will be recognised in **HH:MM:SS**, **H:MM:SS**, **MM:SS** or **M:SS** formats.

In the above example there are hyphens but these are unnecessary to make make the plugin recognise chapters. Most characters such as `+`, `*`, `~`, `:` or `-` will be stripped so the "chapter tip" or "cue tip" will display correctly. Whitespace is also trimmed from the chapter description as well.\
Chapters or indexes that have timecode in the description will be ignored.\
For eample:
```
The sunrise 20:34
```
Will be ignored.\
\
Additionally time in seconds will be ignored.
```
120 Chapter name
```
Formats that will work:
```
02:32 Vivid sunrise
2:32 - Vivid sunset
0:23 Sunspots
00:30 + Bark at the moon
```
As mentioned the there is no need for a `00:00` chapter as with **YouTube** to trigger the inclusion of the chapters.\
> **Note** With little effort (for the tecchnically inclined) the plugin can be augmented to accept chapter data from a custom field to suit a more specific workflow.

> **Note**\
> Dont forget that with this plugin you can use [cue points](https://studio.support.brightcove.com/media/general/working-cue-points-media-module.html) at the same time. Timestamps that are the same will be removed and the cue point metadata will override the chapter in the long description field.\
Cue points will render on the player in the same way as chapters found in the long description field.

#### Cue marker colours
When the plugin is being configured a **Video Cloud** user has the option of setting the marker colour as follows:

```json
{
    "cue_marker_color": "#FF69B4"
}
```
Or
```json
{
    "cue_marker_color": "hotpink"
}
```
Or with some opacity?

```json
{
    "cue_marker_color": "rgba(245, 39, 145, 0.5)"
}
```
![edit cue colour](readme_images/options.gif)

### Installation

Please follow this guide on installing plugins on a Brightcove player
