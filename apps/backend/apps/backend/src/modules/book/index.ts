import BookModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const BOOK_MODULE = "book"

export default Module(BOOK_MODULE, {
  service: BookModuleService,
})
