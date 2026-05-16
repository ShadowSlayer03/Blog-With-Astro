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
        class: {
          type: String,
        },
        loading: {
          type: String,
          default: "lazy",
          matches: ["lazy", "eager"],
        },
        decoding: {
          type: String,
          default: "async",
          matches: ["async", "sync", "auto"],
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
        class: {
          type: String,
        },
      },
    },
  },
});