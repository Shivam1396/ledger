let transaction_model = require("../models/transaction_model")
let ledger_model = require("../models/ledger_model")
let account_model = require("../models/accound_model")
let emailservice = require("../services/email_servicees")
let mongoose = require("mongoose")

async function createTransaction(req, res) {
    let { fromAcount, toAcount, amount, idempotencykey } = req.body

    if (!fromAcount || !toAcount || !amount || !idempotencykey) {
        return res.status(400).json({
            message: "fromaccount , toacccount , amount and idempotencykey is required"
        })
    }

    let fromAccount = await account_model.findOne({
        _id: fromAcount,
    })

    let toAccount = await account_model.findOne({
        _id: toAcount,
    })

    if (!fromAccount || !toAccount) {
        return res.status(400).json({
            message: "invalid fromAccount or toAccount"
        })
    }

    let isTransactionAlreadyExists = await transaction_model.findOne({
        idempotencykey: idempotencykey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }

        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "transaction is in pending status",
            })
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "transaction is failed . please retry",
            })
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "transaction IS REVERSED PLEASE RETRY"
            })
        }
    }

    if (fromAccount.status !== "ACTIVE" || toAccount.status !== "ACTIVE") {
        return res.status(500).json({
            message: `Both ${fromAccount} or ${toAccount} must be Active`
        })
    }

    let balance = await fromAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: "insufficient balance"
        })
    }

    let session = await mongoose.startSession()
    session.startTransaction()

    try {

        let [transaction] = await transaction_model.create([{
            fromAcount: fromAccount,
            toAcount: toAccount,
            amount,
            idempotencykey,
            status: "PENDING"
        }], { session })

        let debitLedgerEntry = await ledger_model.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        let creditLedgerEntry = await ledger_model.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction.status = "COMPLETED"

        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        await emailservice.sendTransactionEmail(
            req.user.email,
            req.user.name,
            amount,
            toAccount
        )

        return res.status(201).json({
            message: "Transaction completed succesfully",
            transaction: transaction
        })

    } catch (error) {

        await session.abortTransaction()
        session.endSession()

        return res.status(500).json({
            message: "transaction failed",
            error: error.message
        })
    }
}


async function createInitialFundsTransacction(req, res) {

    let { toAcount, amount, idempotencykey } = req.body

    if (!toAcount || !amount || !idempotencykey) {
        return res.status(400).json({
            message: "toAcount , amount and idempotency key is required"
        })
    }

    let toAccount = await account_model.findOne({
        _id: toAcount
    })

    if (!toAccount) {
        return res.status(400).json({
            message: "invalid toAcount"
        })
    }

    let fromAccount = await account_model.findOne({
        systemUser: true,
        user: req.user._id
    })

    if (!fromAccount) {
        return res.status(400).json({
            message: "invalid system user account"
        })
    }

    let session = await mongoose.startSession()
    session.startTransaction()

    try {

        let transaction = new transaction_model({
            fromAcounnt: fromAccount._id,
            toAcount: toAccount._id,
            amount: amount,
            idempotencykey: idempotencykey,
            status: "PENDING"

        } )

        let debitledgerentry = await ledger_model.create([{
            account: fromAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"

        }], { session })

        let creditledgerentry = await ledger_model.create([{
            account: toAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"

        }], { session })

        transaction.status = "COMPLETED"

        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            message: "initial fund completed succesfully",
            transaction: transaction
        })

    } catch (error) {

        await session.abortTransaction()
        session.endSession()

        return res.status(500).json({
            message: "initial fund transaction failed",
            error: error.message
        })
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransacction
}