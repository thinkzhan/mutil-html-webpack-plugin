const path = require('path');
const fs = require('fs');

const url = require('url');
const DefinePlugin = require('webpack/lib/DefinePlugin');

function getDirsInDir(dir, ignorePages = []) {
	const files = fs.readdirSync(path.resolve(dir));
	const ret = [];
	files.forEach(fileName => {
		if (
			ignorePages.findIndex(em => em === fileName) < 0 // not in ignorePages
			&& fs.lstatSync(path.resolve(dir, fileName)).isDirectory() // is Directory
		) {
			ret.push(fileName);
		}
	});
    console.log(ret);
	return ret;
}
/**
 * process.env.NODE_ENV
 * or webpack use DefinePlugin to define process.env.NODE_EN
 */
function isProduction(compiler) {
	if (process.env.NODE_ENV === 'production') {
		// define in nodejs
		return true;
	}
	const plugins = compiler.options.plugins;
	for (let i = 0; i < plugins.length; i++) {
		const plugin = plugins[i];
		try {
			if (plugin.__proto__.constructor === DefinePlugin) {
				if (plugin.definitions['process.env.NODE_ENV'] === '"production"') {
					// define by DefinePlugin
					return true;
				}
			}
		} catch (_) {
			//
		}
	}
	return false;
}

/**
 * add a file to webpack compilation output files
 */
function addFileToWebpackOutput(compilation, filename, fileContent) {
	compilation.assets[filename] = {
		source: () => {
			return fileContent;
		},
		size: () => {
			return Buffer.byteLength(fileContent, 'utf8');
		}
	};
}

/**
 * get name for a file
 * /a/b/c.html => c.html
 */
function getFilenameByFilePath(filePath) {
	const parse = path.parse(filePath);
	return parse.name + parse.ext;
}

/**
 * get publicPath config in webpack
 */
function getPublicPath(compilation) {
	return compilation.compiler.options.output.publicPath || '';
}

module.exports = {
	isProduction,
	addFileToWebpackOutput,
	getFilenameByFilePath,
	getPublicPath,
	getDirsInDir
};
