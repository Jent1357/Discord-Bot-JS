const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mutevoice')
        .setDescription('Mutes all users in a voicechat')
        .addChannelOption(option =>
            option
                .setName("voicechat")
                .setDescription("Which channel do you want to be quiet?")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
    async execute(interaction) {
        const voicechatOption = interaction.options.getChannel("voicechat");

        if (!voicechatOption || voicechatOption.type !== ChannelType.GuildVoice) {
            return interaction.reply({ content: 'Please provide a valid voice channel.', ephemeral: true });
        }

        try {
            const voicechat = await interaction.guild.channels.fetch(voicechatOption.id);

            if (!voicechat || voicechat.type !== ChannelType.GuildVoice) {
                return interaction.reply({ content: 'The provided channel is not a valid voice channel.', ephemeral: true });
            }

            const membersInVoiceChannel = voicechat.members;

            const unmutedMembers = membersInVoiceChannel.filter(member => !member.voice.serverMute);

            if (unmutedMembers.size === 0) {
                return interaction.reply({ content: `No unmuted users found in \`${voicechat.name}\`.`, ephemeral: true });
            }

            const mutePromises = unmutedMembers.map(member => 
                member.voice.setMute(true, 'Muted by bot command')
            );

            await Promise.all(mutePromises);

            await interaction.reply({ content: `Muted ${unmutedMembers.size} user(s) in \`${voicechat.name}\`.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error muting the users in the voice channel.', ephemeral: true });
        }
    }
};
