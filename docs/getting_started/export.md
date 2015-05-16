Export Panel
============

The Export Panel allows to download the current Diaporama.

![](imgs/overview/4.jpg)

## Download Formats

There are two ways to download it:

- **Recommended:** Download the all-in-one ZIP export.
- Download the current `diaporama.json`.

### Download the ZIP Export

This ZIP contains the `diaporama.json` and all resources (images) needed by the Diaporama.

The **Image Quality** is a very important field, you must select the option that suits
the most your Diaporama usage. Selecting a lower image quality will save bandwidth
(reducing image size) but can drastically **improve the Diaporama performance**.
Do not select `Original`, unless you really want to use your original image resolution.

If you check *includes web slideshow*, it will also contains `index.html` and `diaporama.bundle.js` files that provide a **default Diaporama Engine that will run
the diaporama in fullscreen**.

> It is recommended to open the index.html through a server and not directly using `file:///` because
`file:///` is likely to break because of the Ajax Request used to retrieve the `diaporama.json`.

### Download `diaporama.json`

The `diaporama.json` file is already saved in the working directory when you edit anything with Diaporama Maker.
You might still want to download this file to save a diaporama state or update an existing work stored somewhere else.


## Customizing the ZIP Export

The provided `index.html` is just a template and is highly customisable.

You might not even need that `index.html` and `diaporama.bundle.js` and just reuse the `diaporama.json` on your own using the library `diaporama`.

After all, Diaporama Maker is just a tool to help you making the final `diaporama.json`. You might directly write this JSON if you prefer to.

For `diaporama` format and usage documentation, please checkout [http://gre.gitbooks.io/diaporama/content/index.html](http://gre.gitbooks.io/diaporama/content/index.html).
