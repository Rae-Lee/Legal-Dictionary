const db = require('../models')
const { Note, sequelize } = db
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
const { getUser } = require('../helpers/auth-helpers')
const { DataTypes } = require('sequelize')
const notesController = {
  deleteNote: async (req, res, next) => {
    try {
      const id = req.params.id
      const note = await Note.findByPk(id, {
        raw: true,
        nest: true
      })
      if (!note) {
        return res.json({
          status: 403,
          message: '找不到此筆記'
        })
      }
      await sequelize.query('DELETE FROM `Notes` WHERE `id` = $id;', {
        type: sequelize.QueryTypes.DELETE,
        bind: { id },
        raw: true,
        nest: true
      })
      return res.json({
        status: 200,
        data: note
      })
    } catch (err) {
      next(err)
    }
  },
  editNote: async (req, res, next) => {
    try {
      const id = Number(req.url.substring(1, req.url.length))
      const content = req.body.content
      if (!content) {
        return res.json({
          status: 400,
          message: ['筆記內容不可空白！']
        })
      }
      const note = await Note.findByPk(id)
      if (!note) {
        return res.json({
          status: 403,
          message: '找不到此筆記！'
        })
      }
      await sequelize.query('UPDATE `Notes` SET `content`= $content WHERE `id`=$id ;', {
        type: sequelize.QueryTypes.UPDATE,
        bind: { content, id },
        raw: true,
        nest: true
      })
      return res.json({
        status: 200,
        data: {
          ...note.toJSON(),
          content
        }
      })
    } catch (err) {
      next(err)
    }
  },
  addNote: async (req, res, next) => {
    try {
      const id = req.params.id
      const content = req.body.content
      if (!content) {
        return res.json({
          status: 400,
          message: ['筆記內容不可空白！']
        })
      } else {
        const note = await Note.create({
          userId: getUser(req).id,
          elementId: id,
          content
        })
        const createdNote = {
          ...note.toJSON(),
          relativeTime: dayjs(note.createdAt).fromNow()
        }
        return res.json({
          status: 200,
          data: createdNote
        })
      }
    } catch (err) {
      next(err)
    }
  }
}
module.exports = notesController
