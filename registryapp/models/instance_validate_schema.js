var InstanceSchema = {
    type: "object",
    properties: {
        api_version: {
            id: "/properties/api_version",
            type: "string"
        },
        colors: {
            id: "/properties/colors",
            properties: {
                focus: {
                    id: "/properties/colors/properties/focus",
                    properties: {
                        bg: {
                            id: "/properties/colors/properties/focus/properties/bg",
                            type: "string"
                        },
                        fg: {
                            id: "/properties/colors/properties/focus/properties/fg",
                            type: "string"
                        }
                    },
                    type: "object"
                },
                main: {
                    id: "/properties/colors/properties/main",
                    properties: {
                        bg: {
                            id: "/properties/colors/properties/main/properties/bg",
                            type: "string"
                        },
                        fg: {
                            id: "/properties/colors/properties/main/properties/fg",
                            type: "string"
                        }
                    },
                    type: "object"
                }
            },
            type: "object"
        },
        description: {
            id: "/properties/description",
            type: "string"
        },
        images: {
            id: "/properties/images",
            properties: {
                main: {
                    id: "/properties/images/properties/main",
                    type: "string"
                },
                small: {
                    id: "/properties/images/properties/small",
                    type: "string"
                }
            },
            type: "object"
        },
        intermine_version: {
            "id": "/properties/intermine_version",
            "type": "string"
        },
        location: {
            id: "/properties/location",
            properties: {
                latitude: {
                    id: "/properties/location/properties/latitude",
                    type: "string"
                },
                longitude: {
                    id: "/properties/location/properties/longitude",
                    type: "string"
                }
            },
            type: "object"
        },
        name: {
            id: "/properties/name",
            type: "string"
        },
        neighbours: {
            id: "/properties/neighbours",
            items: {
                id: "/properties/neighbours/items",
                type: "string"
            },
            type: "array"
        },
        organisms: {
            id: "/properties/organisms",
            items: {
                id: "/properties/organisms/items",
                type: "string"
            },
            type: "array"
        },
        twitter: {
            id: "/properties/twitter",
            type: "string"
        },
        url: {
            id: "/properties/url",
            type: "string"
        },
        web_version: {
            id: "/properties/web_version",
            type: "string",
            required: true
        }
    },
    required: ['description', 'location', 'name', 'neighbours', 'organisms', 'twitter', 'url']
};

module.exports = { InstanceSchema: InstanceSchema };