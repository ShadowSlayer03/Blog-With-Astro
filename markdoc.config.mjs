import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
  tags: {
    image: {
      render: component("./src/components/mdoc/Image.astro"),
      attributes: {
        src: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
        },
      },
    },

    video: {
      render: component("./src/components/mdoc/Video.astro"),
      attributes: {
        src: {
          type: String,
          required: true,
        },
      },
    },
  },
});
