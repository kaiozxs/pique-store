import VerificationModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const VERIFICATION_MODULE = "verification"

export default Module(VERIFICATION_MODULE, {
  service: VerificationModuleService,
})
