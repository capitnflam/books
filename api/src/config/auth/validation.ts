import * as Joi from '@hapi/joi'

export default Joi.object({
  JWT_SECRET: Joi.string(),
})
