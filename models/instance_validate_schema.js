/**
 * Schemas to validate JSON requests to instances POST and PUT endpoints.
 */

// POST SCHEMA
var InstanceSchema = {
    type: "object",
    properties: {
        description: {
            id: "/properties/description",
            type: "string"
        },
        maintainerEmail: {
            id: "/properties/maintainerEmail",
            type: "string"
        },
        maintainerGithubUrl: {
            id: "/properties/maintainerGithubUrl",
            type: "string"
        },
        maintainerOrgName: {
            id: "/properties/maintainerOrgName",
            type: "string"
        },
        maintainerUrl: {
            id: "/properties/maintainerUrl",
            type: "string"
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
        isProduction: {
            id: "/properties/isProduction",
            type: "boolean"
        },
        url: {
            id: "/properties/url",
            type: "string"
        }
    },
    required: ['name', 'url']
};

// UPDATE SCHEMA 
var InstancePutSchema = {
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
                },
                header: {
                    id: "/properties/colors/properties/header",
                    properties: {
                        text: {
                            id: "/properties/colors/properties/header/properties/text",
                            type: "string"
                        },
                        main: {
                            id: "/properties/colors/properties/header/properties/main",
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
        maintainerOrgName: {
            id: "/properties/maintainerOrgName",
            type: "string"
        },
        maintainerUrl: {
            id: "/properties/maintainerUrl",
            type: "string"
        },
        maintainerEmail: {
            id: "/properties/maintainerEmail",
            type: "string"
        },
        maintainerGithubUrl: {
            id: "/properties/maintainerGithubUrl",
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
                },
                logo: {
                  id: "/properties/images/properties/logo",
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
        isProduction: {
            id: "/properties/isProduction",
            type: "boolean"
        },
        url: {
            id: "/properties/url",
            type: "string"
        },
        release_version: {
            id: "/properties/release_version",
            type: "string"
        }
    }
};

module.exports = { InstanceSchema: InstanceSchema, InstancePutSchema : InstancePutSchema };
