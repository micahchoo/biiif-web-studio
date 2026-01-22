An open-source project connecting different archives through a common cross-annotation platform. The purpose was to make archives more democratic in the described and annotated ways. The core was to achieve this using the W3C Web Annotation Standard and to see how different archival description standards might translate with the web annotation.

> Project Duration: 6 months

> Organization: **h****[ttps://www.milli.link](https://href.li/?https://www.milli.link/)**

> My Role: User Research, Wireframing, Prototyping

In the video, the team demos the tool, and I discuss the platform design with the participants. (2:03:00 - 2:12:00)

Milli started as a platform to connect different archives to each other and open them up to annotation. We were piloting the platform with metadata from the [NCBS Archives](https://href.li/?https://archives.ncbs.res.in/collections)

The idea was to build interconnections between private, institutional, governmental, and personal archives. Through our user research, we identified these insights

1.  Most archives will only share their metadata, so the annotation target has to be metadata
2.  Users might want to annotate different archival items for different purposes (this mechanism was also highlighted in the W3C Standards for Web Annotation)
3.  Different archives will use different standards for the metadata - eg. EAD, FOAF, Dublincore etc. This meant that importing of metadata for partners would have to be agnostic to these standards
4.  Users annotate -> Users Discover Annotations -> Users Annotate more OR -> Users narrate stories using collections of annotations

![image](https://64.media.tumblr.com/1b10e3db2f177af8f1fbb4cc112fc412/df87286c7ba95bdf-52/s1280x1920/b7d610fb5901e57e86dd8aa615c02c1976f47fd3.png)

Of these, I worked on making a mechanism for annotating an archival object as well as how the archival object looked. I also helped design the information visible on each search result.

## On the archival object page, my priorities were to show

1.  Which fields are annotable,
2.  what fields act as access points to other objects in the archive
3.  What is the hierarchy of the current object
4.  Create user flows for private curation, notetaking, and collection - including a way to subscribe to new annotations, make a private annotation and save objects to a jhola(“metaphor for a bag”)

## Annotation Widget

My work also involved designing the Annotation Widget, a vital tool for user interaction, allowing:

-   Structuring each annotation as a key-value pair, and
-   Annotation of the entire object as well as parts of the object’s description.

![image](https://64.media.tumblr.com/a1cd034fa37a6fc4ffb9de9e1d28136b/df87286c7ba95bdf-9c/s500x750/5147e0974ec9ea5f8ac13a75fa9ccfbba3c3abe0.png)

## Search Hits

In order to enrich the user experience, I optimized the search hits by:

-   Using the metadata categorization from the Archival Object page to add more context in an accordion on the results card, and
-   Indicating whether the search had hits on the annotations in the object.

![image](https://64.media.tumblr.com/f3ef21e79f2ffa1330c12aca7dce2643/df87286c7ba95bdf-58/s2048x3072/b18009cdd07711a99d58d277b57aafc3022a3eea.png)