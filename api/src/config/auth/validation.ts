import Joi from 'joi'

export default Joi.object({
  JWT_SECRET: Joi.string(),
})
