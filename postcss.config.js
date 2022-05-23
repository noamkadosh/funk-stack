module.exports = ctx => ({
	// syntax: 'postcss-sass',
	plugins: {
		'postcss-import': {},
		tailwindcss: {},
		autoprefixer: {},
		cssnano: ctx.env === 'production' ? {} : false
	},
	map: ctx.options.map
})
