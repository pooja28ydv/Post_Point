const Joi = require("joi"); 

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow("",null),
        category: Joi.string().valid('Animal','Travel','Food','Education','Art','Lifestyle','Entertainment','Sport','Technology').required(),
    }).required(),
    ai_image_url: Joi.string().allow("", null),  // ← AI-generated image URL
});


module.exports.reviewSchema = Joi.object({
     review: Joi.object({
         comment: Joi.string().required(),
         rating: Joi.number().required(),
     }).required(),
})
