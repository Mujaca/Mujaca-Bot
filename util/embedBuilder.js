var Discord = require('discord.js');
var colors = new Map();

colors.set("blurple","#5865F2");
colors.set("green","#57F287");
colors.set("yellow","#FEE75C");
colors.set("magenta","#EB459E");
colors.set("red","#ED4245");
colors.set("white","#FFFFFF");
colors.set("black","#000000");
colors.set("purple","#8532a8");

module.exports = {
  createEmbed: (pTitle,pDescription,pColor) => {
    var color = "";

    if(colors.get(pColor) != undefined) {
      color = colors.get(pColor);
    } else if(pColor.split("")[0] == "#") {
      color = pColor;
    }
    
    var embed = new Discord.MessageEmbed();
    embed.setTitle(pTitle);
    embed.setDescription(pDescription);
    embed.setColor(color);
    embed.setTimestamp();

    return embed;
  }
}