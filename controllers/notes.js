const db = require('../models')
const { Note } = db
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
const { getUser } = require('../helpers/auth-helpers')
const notesController = {
  deleteNote: async (req, res, next) => {
    try {
      const id = req.params.id
      const note = await Note.findByPk(id, {
        raw: true,
        nest: true
      })
      const deleteNote = await note.destroy()
      return res.json({
        status: 200,
        data: deleteNote
      })
    } catch (err) {
      next(err)
    }
  },
  editNote: async (req, res, next) => {
    try {
      const id = req.params.id
      const content = req.body.content
      if (!content) {
        return res.json({
          status: 400,
          message: ['筆記內容不可空白！']
        })
      } else {
        const note = await Note.findByPk(id, {
          raw: true,
          nest: true
        })
        const editNote = await note.update({
          ...note,
          content
        })
        const editedNote = {
          ...editNote,
          relativeTime: dayjs(editNote.createdAt).fromNow()
        }
        return res.json({
          status: 200,
          data: editedNote
        })
      }
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
          ...note,
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
