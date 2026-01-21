import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Initial sample commands
const sampleCommands = [
    {
        id: uuidv4(),
        title: 'Git - Undo Last Commit',
        command: 'git reset --soft HEAD~1',
        category: 'git',
        description: 'Undo the last commit but keep changes staged',
        isFavorite: true,
        tags: ['git', 'undo', 'reset'],
    },
    {
        id: uuidv4(),
        title: 'Git - Interactive Rebase',
        command: 'git rebase -i HEAD~n',
        category: 'git',
        description: 'Interactively rebase the last n commits',
        isFavorite: false,
        tags: ['git', 'rebase', 'history'],
    },
    {
        id: uuidv4(),
        title: 'Docker - Remove All Containers',
        command: 'docker rm $(docker ps -aq)',
        category: 'docker',
        description: 'Remove all stopped Docker containers',
        isFavorite: true,
        tags: ['docker', 'cleanup', 'containers'],
    },
    {
        id: uuidv4(),
        title: 'Docker - Prune System',
        command: 'docker system prune -a --volumes',
        category: 'docker',
        description: 'Remove all unused images, containers, volumes, and networks',
        isFavorite: false,
        tags: ['docker', 'cleanup', 'prune'],
    },
    {
        id: uuidv4(),
        title: 'NPM - Clear Cache',
        command: 'npm cache clean --force',
        category: 'npm',
        description: 'Force clear the npm cache',
        isFavorite: false,
        tags: ['npm', 'cache', 'cleanup'],
    },
    {
        id: uuidv4(),
        title: 'NPM - List Outdated',
        command: 'npm outdated',
        category: 'npm',
        description: 'List all outdated packages',
        isFavorite: false,
        tags: ['npm', 'packages', 'update'],
    },
    {
        id: uuidv4(),
        title: 'Bash - Find Large Files',
        command: 'find . -type f -size +100M',
        category: 'bash',
        description: 'Find all files larger than 100MB',
        isFavorite: true,
        tags: ['bash', 'find', 'files'],
    },
    {
        id: uuidv4(),
        title: 'Bash - Kill Process by Port',
        command: 'kill -9 $(lsof -t -i:PORT)',
        category: 'bash',
        description: 'Kill any process running on specified port',
        isFavorite: true,
        tags: ['bash', 'kill', 'port'],
    },
    {
        id: uuidv4(),
        title: 'React - Create New Component',
        command: 'npx generate-react-cli component ComponentName',
        category: 'react',
        description: 'Generate a new React component with CLI',
        isFavorite: false,
        tags: ['react', 'component', 'generate'],
    },
    {
        id: uuidv4(),
        title: 'PostgreSQL - List Databases',
        command: 'psql -l',
        category: 'database',
        description: 'List all PostgreSQL databases',
        isFavorite: false,
        tags: ['postgres', 'database', 'list'],
    },
];

const initialState = {
    commands: sampleCommands,
    searchQuery: '',
    selectedCategory: 'all',
    showFavoritesOnly: false,
};

const commandsSlice = createSlice({
    name: 'commands',
    initialState,
    reducers: {
        addCommand: (state, action) => {
            state.commands.unshift({
                id: uuidv4(),
                ...action.payload,
                isFavorite: false,
            });
        },
        updateCommand: (state, action) => {
            const index = state.commands.findIndex(cmd => cmd.id === action.payload.id);
            if (index !== -1) {
                state.commands[index] = { ...state.commands[index], ...action.payload };
            }
        },
        deleteCommand: (state, action) => {
            state.commands = state.commands.filter(cmd => cmd.id !== action.payload);
        },
        toggleFavorite: (state, action) => {
            const command = state.commands.find(cmd => cmd.id === action.payload);
            if (command) {
                command.isFavorite = !command.isFavorite;
            }
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        toggleShowFavorites: (state) => {
            state.showFavoritesOnly = !state.showFavoritesOnly;
        },
    },
});

export const {
    addCommand,
    updateCommand,
    deleteCommand,
    toggleFavorite,
    setSearchQuery,
    setSelectedCategory,
    toggleShowFavorites,
} = commandsSlice.actions;

export default commandsSlice.reducer;
