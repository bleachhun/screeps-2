const roleWorker = require('role.worker')
const roleHarvester = require('role.harvester')
const roleUpgrader = require('role.upgrader')
const roleBuilder = require('role.builder')
const roleTanker = require('role.tanker')

const bodyCosts = body => _.reduce(body, (acc, x) => acc + BODYPART_COST[x], 0)

const creepFactory = (spawn, role, body, targetCount) => () => {

    if(spawn.room.energyAvailable < bodyCosts(body)) return

    var xs = _.filter(Game.creeps, (creep) => creep.memory.role == role)
    if(xs.length < targetCount) {
        const result = spawn.spawnCreep(body, `${role}-${Game.time}`, {memory: {role: role}})
        switch(result) {
            case OK: return
            case ERR_NOT_ENOUGH_ENERGY: break;
            default: console.log('[spawn.spawnCreep] - unhandled', result)
        }
    }
}

printRooms = () => {
    for(var name in Game.creeps) {
        const creep = Game.creeps[name]
        console.log(`${creep}: room = ${creep.room}`)
    }
}

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) delete Memory.creeps[name];
    }

    const spawn = Game.spawns['Spawn1']

    const lightMaintenance = [WORK, CARRY, MOVE]
    const mediumMaintenance = [MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY]
    const heavyMaintenance = [MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY]
    const harvesterBody = [WORK, WORK, MOVE]

    creepFactory(spawn, 'tanker', mediumMaintenance, 5)()
    creepFactory(spawn, 'upgrader', mediumMaintenance, 3)()

    for(var name in Game.creeps) {
        const creep = Game.creeps[name]
        if(creep.memory.role == 'tanker') roleTanker.run(creep)
        else if(creep.memory.role == 'upgrader') roleUpgrader.run(creep)
    }
}