/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file IsSyncingMethod.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2019
 */

import AbstractMethod from '../../../lib/methods/AbstractMethod';

export default class IsSyncingMethod extends Method {
    /**
     * @param {Array} parameters
     * @param {EthereumConfiguration} config
     *
     * @constructor
     */
    constructor(parameters, config) {
        super('eth_syncing', 0, parameters, config);
    }

    /**
     * This method will be executed after the RPC request.
     *
     * @method afterExecution
     *
     * @param {Object} response
     *
     * @returns {Object|Boolean}
     */
    afterExecution(response) {
        if (typeof response !== 'boolean') {
            return this.formatters.outputSyncingFormatter(response);
        }

        return response;
    }
}
