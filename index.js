const fs = require('fs');
const url = require('url');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

const util = require('./util');


class MutilHtmlWebpackPlugin {

	constructor(options) {
		options = Object.assign({}, options);
		this.options = options;
		this.entryMap = {};
		this.webpackEntry = {};
		const { page, toPage, ext, toExt, moreChunks, ignorePages, specialPages, alwaysWriteToDisk} = options;
		const pageNames = util.getDirsInDir(page, ignorePages);

		pageNames.forEach(pageName => {
			let templatePath = path.resolve(page, pageName, `page${ext || '.vm'}`);

			let entryPath = path.resolve(page, pageName, 'page.js');;
			let htmlOutputFilename = path.join(toPage || '', `${pageName}${toExt || '.vm'}`);

            let chunks = (moreChunks || [] ).concat(pageName);
			this.entryMap[pageName] = {
				templatePath,
				entryPath,
				htmlOutputFilename,
                chunks: chunks
			}

			this.webpackEntry[pageName] = [entryPath];
		});

        if (specialPages && typeof specialPages === 'object') {
            for (let spageName in specialPages) {
                if (specialPages.hasOwnProperty(spageName)) {
                    let sPageCfg = specialPages[spageName];
                    let tmp = {};
                    if (sPageCfg.moreChunks && sPageCfg.moreChunks.length)
                        tmp.chunks = sPageCfg.moreChunks.concat(spageName);
                    // todo more
                    Object.assign(this.entryMap[spageName], tmp);
                }
            }
        }

	}

	apply(compiler) {
		global._isProduction = util.isProduction(compiler);
		const { options: compilerOptions } = compiler;
		const { entryMap } = this;
		const { pagemap , alwaysWriteToDisk} = this.options;


		Object.keys(entryMap).forEach(pageName => {
			// ensure entryMap from pages has been add to webpack entry
			// webpack-dev-server may modify compilerOptions.entry, e.g add webpack-dev-server/client to every entry
			compilerOptions.entry = Object.assign(this.webpackEntry, compilerOptions.entry);

			const { templatePath, htmlOutputFilename , chunks} = entryMap[pageName];

			new HtmlWebpackPlugin({
                filename: htmlOutputFilename,
				template: templatePath,
                inject: 'body',
                cache: false,
                alwaysWriteToDisk: alwaysWriteToDisk || false,
                chunks: chunks,
                chunksSortMode: 'dependency'
			}).apply(compiler);

		});

        if (alwaysWriteToDisk) {
            new HtmlWebpackHarddiskPlugin().apply(compiler);
        }


		compiler.plugin('emit', (compilation, callback) => {
			if (pagemap) {
				const publicPath = util.getPublicPath(compilation);
				const outJson = {};
				Object.keys(this.entryMap).forEach(name => {
					outJson[name] = `${this.entryMap[name].htmlOutputFilename}.html`;
				});
				util.addFileToWebpackOutput(compilation, 'pagemap.json', JSON.stringify(outJson));
			}
			callback();
		});
	}

	/**
	 * 重写entry option
	 */
	entry(orgEntry) {
		return Object.assign({}, orgEntry, this.webpackEntry);
	}

}

module.exports = MutilHtmlWebpackPlugin;
