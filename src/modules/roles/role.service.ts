import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Role } from "./role.model";


@Injectable()
export class RoleService{
    constructor(@InjectModel(Role) roleRepository: typeof Role) {}
    
}