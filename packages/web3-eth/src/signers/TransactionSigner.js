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
 * @file TransactionSigner.js
 * @author Samuel Furter <samuel@ethereum.org>, Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2019
 */
import Nat from 'eth-lib/lib/nat';
import Bytes from 'eth-lib/lib/bytes';
import Hash from 'eth-lib/lib/hash';
import RLP from 'eth-lib/lib/rlp';
import Account from 'eth-lib/lib/account';

export default class TransactionSigner {
    /**
     * Signs the transaction
     *
     * @param {Object} transaction
     * @param {String} privateKey
     *
     * @returns {Promise<{messageHash, v, r, s, rawTransaction}>}
     */
    async sign(transaction, privateKey) {
        const rlpEncoded = this.createRlpEncodedTransaction(transaction);
        const hash = Hash.keccak256(rlpEncoded);
        const signature = this.createAccountSignature(hash, privateKey);
        const rawTransaction = RLP.encode(this.mapRlpEncodedTransaction(rlpEncoded, signature));
        const values = RLP.decode(rawTransaction);

        return {
            messageHash: hash,
            v: this.trimLeadingZero(values[6]),
            r: this.trimLeadingZero(values[7]),
            s: this.trimLeadingZero(values[8]),
            rawTransaction
        };
    }

    /**
     * RLP encodes the transaction object
     *
     * @method createRlpEncodedTransaction
     *
     * @param {Object} transaction
     *
     * @returns {String}
     */
    createRlpEncodedTransaction(transaction) {
        return RLP.encode([
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.data,
            Bytes.fromNat(transaction.chainId),
            '0x',
            '0x'
        ]);
    }

    /**
     * Creates the signature of the current account
     *
     * @method createAccountSignature
     *
     * @param {String} hash
     * @param {String} privateKey
     *
     * @returns {String}
     */
    createAccountSignature(hash, privateKey) {
        return Account.makeSigner(
            Nat.toNumber(transaction.chainId) * 2 + 35
        )(hash, privateKey);
    }

    /**
     * Combines the decoded transaction with the account decoded account signature and formats the r,v and s.
     *
     * @param {String} rlpEncoded
     * @param {String} signature
     *
     * @returns {Array}
     */
    mapRlpEncodedTransaction(rlpEncoded, signature) {
        const rawTransaction = RLP.decode(rlpEncoded).slice(0, 6).concat(Account.decodeSignature(signature));
        rawTransaction[6] = this.makeEven(this.trimLeadingZero(rawTransaction[6]));
        rawTransaction[7] = this.makeEven(this.trimLeadingZero(rawTransaction[7]));
        rawTransaction[8] = this.makeEven(this.trimLeadingZero(rawTransaction[8]));

        return rawTransaction;
    }

    /**
     * Removes the zeros until no zero follows after '0x'
     *
     * @method trimLeadingZero
     *
     * @param {String} hex
     *
     * @returns {String}
     */
    trimLeadingZero(hex) {
        while (hex && hex.startsWith('0x0')) {
            hex = `0x${hex.slice(3)}`;
        }

        return hex;
    }

    /**
     * Maps the hex string starting with '0x' to an even string with adding an additional zero after '0x' if it isn't.
     *
     * @method makeEven
     *
     * @param {String} hex
     *
     * @returns {String}
     */
    makeEven(hex) {
        if (hex.length % 2 === 1) {
            hex = hex.replace('0x', '0x0');
        }

        return hex;
    }
}
