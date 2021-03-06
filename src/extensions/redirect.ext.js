/**
 * Redirect Extension
 * @module RedirectExtension
 * @author Markus Gilg
 * @requires RequestHelper
 */
'use strict';

/**
 * Request Helper Namespace
 * @const {Object} REQU
 * @private
 */
const REQU = require('./../common/request.helper');

/**
 * returns the Server Address
 * @function getServerAddress
 * @private
 * @return {String} url
 */
const getServerAddress = function () {
    return (this.privates.cfg.server.ssl.usessl ? 'https://' : 'http://') +
        this.privates.cfg.server.address + ':' + this.privates.cfg.server.port;
};

/**
 * 
 * @function isAbsolute
 * @private
 * @param {String} path path of directory
 * @return {Boolean} isabsolute
 */
const isAbsolute = function (path) {
    if (path.substr(path.length - 1, 1) === '*') {
        return false;
    }
    return true;
};

/**
 * @function isRouteExact
 * @private
 * @param {String} url 
 * @param {String} path
 * @return {String} url 
 */
const isRouteExact = function (url, path) {
    console.info(`route exact ${url.split('/').join('')} === ${path.split('/').join('')}`);
    return url.split('/').join('') === path.split('/').join('');
};

/**
 * @function splitWithoutEmpty
 * @private
 * @param {String} value
 * @param {String} tr
 * @return {Array} 
 */
const splitWithoutEmpty = function (value, tr) {
    const result = [];
    const tmp = value.split(tr);
    for (let i = 0; i < tmp.length; i++) {
        if (typeof tmp[i] !== typeof undefined && 
            tmp[i] !== null && 
            tmp[i] !== '') {
            result.push(tmp[i]);
        }
    }
    return result;
};

/**
 * @function isRouteAny
 * @private
 * @param {String} url
 * @param {String} path
 * @return {Boolean} isRouteAny
 */
const isRouteAny = function (url, path) {
    var tmpReal = splitWithoutEmpty(url, '/');
    var tmpMustbe = splitWithoutEmpty(path, '/');
    // is real address shorte we can go back
    if (tmpReal.length < tmpMustbe.length) {
        return false;
    }
    for (let i = 0; i < tmpMustbe.length; i++) {
        const part = tmpMustbe[i];
        if (part === '*') {
            break;
        }
        if (tmpReal[i] !== part) {
            return false;
        }
    }
    return true;
};

/**
 * @function fixRoute
 * @private
 * @param {String} url
 * @param {String} target
 * @return {String}
 */
const fixRoute = function (url, target) {
    var tmpReal = url.split('/');
    var tmpMustbe = target.split('/');
    var result = '';
    for (let i = 0; i < tmpReal.length; i++) {
        const part = tmpReal[i];
        if (tmpMustbe[i]) {
            result += tmpMustbe[i] + '/';
        } else {
            result += part + '/';
        }
    }
    if (result.length > 2) {
        result = result.substr(0, result.length - 1);
    }
    return result;
};

/**
 * redirect the Request when found a Redirect Rule that match
 * @function lookingRedirect
 * @private
 * @param {Object} req Node Request Object
 * @param {Object} res Node Response Object
 * @param {Object} rules Redirect Rules definition
 * @return {Boolean} redirect?
 */
const lookingRedirect = function (req, res, rules) {
    let target;
    this.privates.logger.debug('server is ' + getServerAddress.bind(this)());
    for (const i in rules) {
        if (rules.hasOwnProperty(i)) {
            const rule = rules[i];
            this.privates.logger.debug('check rule ' + i + ' => ' + req.url + ' switch to ' + rule);
            if (isAbsolute(i) && isRouteExact(req.url, i)) {
                target = getServerAddress.bind(this)() + rule;
                this.privates.logger.debug('rule redirect to ' + target);
                REQU.redirect(req, res, target);
                return true;
            } else if (!isAbsolute(i) && isRouteAny(req.url, i)) {
                target = getServerAddress.bind(this)() + fixRoute(req.url, rule);
                this.privates.logger.debug('rule redirect to ' + target);
                REQU.redirect(req, res, target);
                return true;
            }
        }
    }
    return false;
};

/**
 * redirect http Requests to https when https is used
 * @function
 * @private
 * @param {Object} req Node Request Object
 * @param {Object} res Node Response Object
 * @return {Boolean} redirect?
 */
const redirectHttps = function (req, res) {
  if (this.privates.cfg.server.ssl.usessl && this.privates.cfg.server.ssl.redirectnonsslrequests && !req.socket.encrypted) {
    const target = getServerAddress.bind(this)() + req.url;
    this.privates.logger.debug('https redirect to ' + target);
    REQU.redirect(req, res, target);
    return true;
  }
  return false;
};

class RedirectExtension {
    constructor (cfg, logger) {
        this.privates = {
            cfg: cfg,
            logger: logger
        };
    }

    /**
     * check for Redirects
     * @function handle
     * @param {Object} req Node Request Object 
     * @param {Object} res Node Response Object
     * @param {Object} next Connect next Callback
     */
    handle (req, res, next) {
        if (redirectHttps.bind(this)(req, res)) {
            return;
        }
        if (lookingRedirect.bind(this)(req, res, this.privates.cfg.redirectrules)) {
            return;
        }
        this.privates.logger.debug('no redirect rule found');
        next();
    }
}
module.exports = RedirectExtension;
