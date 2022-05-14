const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')

const toml = require('@iarna/toml')
const sort = require('sort-package-json')

function escapeRegExp(string) {
	// $& means the whole matched string
	return string.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')
}

function getRandomString(length) {
	return crypto.randomBytes(length).toString('hex')
}

async function main({ rootDirectory }) {
	const README_PATH = path.join(rootDirectory, 'README.md')
	const FLY_TOML_PATH = path.join(rootDirectory, 'fly.toml')
	const EXAMPLE_ENV_PATH = path.join(rootDirectory, '.env.example')
	const ENV_PATH = path.join(rootDirectory, '.env')
	const PACKAGE_JSON_PATH = path.join(rootDirectory, 'package.json')

	const REPLACER = 'funk-stack-template'

	const DIR_NAME = path.basename(rootDirectory)
	const SUFFIX = getRandomString(2)

	const APP_NAME = (DIR_NAME + '-' + SUFFIX)
		// get rid of anything that's not allowed in an app name
		.replace(/[^\w-]/g, '-')

	/* eslint-disable security/detect-non-literal-fs-filename */
	const [prodContent, readme, env, packageJson] = await Promise.all([
		fs.readFile(FLY_TOML_PATH, 'utf8'),
		fs.readFile(README_PATH, 'utf8'),
		fs.readFile(EXAMPLE_ENV_PATH, 'utf8'),
		fs.readFile(PACKAGE_JSON_PATH, 'utf8'),
		fs.rm(path.join(rootDirectory, '.github/ISSUE_TEMPLATE'), {
			recursive: true
		}),
		fs.rm(path.join(rootDirectory, '.github/PULL_REQUEST_TEMPLATE.md'))
	])
	/* eslint-enable security/detect-non-literal-fs-filename */

	const newEnv = env.replace(
		/^SESSION_SECRET=.*$/m,
		`SESSION_SECRET="${getRandomString(16)}"`
	)

	const prodToml = toml.parse(prodContent)
	prodToml.app = prodToml.app.replace(REPLACER, APP_NAME)

	const newReadme = readme.replace(
		// eslint-disable-next-line security/detect-non-literal-regexp
		new RegExp(escapeRegExp(REPLACER), 'g'),
		APP_NAME
	)

	const newPackageJson =
		JSON.stringify(
			sort({ ...JSON.parse(packageJson), name: APP_NAME }),
			undefined,
			2
		) + '\n'

	/* eslint-disable security/detect-non-literal-fs-filename */
	await Promise.all([
		fs.writeFile(FLY_TOML_PATH, toml.stringify(prodToml)),
		fs.writeFile(README_PATH, newReadme),
		fs.writeFile(ENV_PATH, newEnv),
		fs.writeFile(PACKAGE_JSON_PATH, newPackageJson)
	])
	/* eslint-enable security/detect-non-literal-fs-filename */

	console.log(
		`
Setup is almost complete. Follow these steps to finish initialization:

- Start the database:
  pnpm run docker

- Run setup (this updates the database):
  pnpm run setup

- Run the first build (this generates the server you will run):
  pnpm run build

- You're now ready to rock and roll 🤘
  pnpm run dev
    `.trim()
	)
}

module.exports = main
