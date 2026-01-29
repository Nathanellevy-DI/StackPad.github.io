/**
 * DraggableDashboard.jsx - Customizable Dashboard Layout
 * 
 * Allows users to drag widgets to any position in a 2-column grid.
 * Layout persists in localStorage per workspace.
 */

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';

// Import all dashboard widgets
import ZenTimer from '../ZenTimer/ZenTimer';
import CommandSearch from '../CommandVault/CommandSearch';
import SystemLogs from '../SystemLogs/SystemLogs';
import SlackDrafter from '../SlackIntegration/SlackDrafter';

import './DraggableDashboard.css';

// Map component names to actual components
const WIDGET_COMPONENTS = {
    ZenTimer: ZenTimer,
    CommandSearch: CommandSearch,
    SystemLogs: SystemLogs,
    SlackDrafter: SlackDrafter,
};

// Default layout - 2 columns
const DEFAULT_LAYOUT = {
    left: [
        { id: 'timer', title: 'Zen Timer', component: 'ZenTimer' },
        { id: 'logs', title: 'System Logs', component: 'SystemLogs' },
    ],
    right: [
        { id: 'commands', title: 'Command Vault', component: 'CommandSearch' },
        { id: 'slack', title: 'Quick Draft', component: 'SlackDrafter' },
    ],
};

export default function DraggableDashboard() {
    const workspace = useSelector(selectCurrentWorkspace);
    const workspaceId = workspace?.id || 'default';
    const storageKey = `stackpad_dashboard_layout_v2_${workspaceId}`;

    // Load saved layout or use default
    const [layout, setLayout] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return DEFAULT_LAYOUT;
            }
        }
        return DEFAULT_LAYOUT;
    });

    const [isEditMode, setIsEditMode] = useState(false);

    // Save layout to localStorage
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(layout));
    }, [layout, storageKey]);

    // Handle drag end - move between or within columns
    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceColumn = source.droppableId;
        const destColumn = destination.droppableId;

        // Create copies of the columns
        const newLayout = { ...layout };
        const sourceItems = [...layout[sourceColumn]];
        const destItems = sourceColumn === destColumn ? sourceItems : [...layout[destColumn]];

        // Remove from source
        const [movedItem] = sourceItems.splice(source.index, 1);

        // Add to destination
        if (sourceColumn === destColumn) {
            sourceItems.splice(destination.index, 0, movedItem);
            newLayout[sourceColumn] = sourceItems;
        } else {
            destItems.splice(destination.index, 0, movedItem);
            newLayout[sourceColumn] = sourceItems;
            newLayout[destColumn] = destItems;
        }

        setLayout(newLayout);
    };

    // Reset to default layout
    const resetLayout = () => {
        setLayout(DEFAULT_LAYOUT);
    };

    // Render widget by component name
    const renderWidget = (componentName) => {
        const Component = WIDGET_COMPONENTS[componentName];
        return Component ? <Component /> : null;
    };

    // Render a column with droppable zone
    const renderColumn = (columnId, widgets) => (
        <Droppable droppableId={columnId}>
            {(provided, snapshot) => (
                <div
                    className={`dashboard-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    {widgets.map((widget, index) => (
                        <Draggable
                            key={widget.id}
                            draggableId={widget.id}
                            index={index}
                            isDragDisabled={!isEditMode}
                        >
                            {(provided, snapshot) => (
                                <div
                                    className={`dashboard-widget ${widget.id}-widget ${snapshot.isDragging ? 'dragging' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                >
                                    {isEditMode && (
                                        <div className="drag-handle" {...provided.dragHandleProps}>
                                            <span className="handle-icon">⋮⋮</span>
                                            <span className="widget-label">{widget.title}</span>
                                        </div>
                                    )}
                                    <div className="widget-content">
                                        {renderWidget(widget.component)}
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Empty state for column */}
                    {widgets.length === 0 && isEditMode && (
                        <div className="empty-column-hint">
                            Drop widgets here
                        </div>
                    )}
                </div>
            )}
        </Droppable>
    );

    return (
        <div className="draggable-dashboard">
            {/* Dashboard Controls */}
            <div className="dashboard-controls">
                <button
                    className={`edit-mode-btn ${isEditMode ? 'active' : ''}`}
                    onClick={() => setIsEditMode(!isEditMode)}
                >
                    {isEditMode ? '✓ Done' : '⚙️ Customize'}
                </button>
                {isEditMode && (
                    <button className="reset-btn" onClick={resetLayout}>
                        ↺ Reset
                    </button>
                )}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className={`dashboard-grid ${isEditMode ? 'edit-mode' : ''}`}>
                    {renderColumn('left', layout.left)}
                    {renderColumn('right', layout.right)}
                </div>
            </DragDropContext>
        </div>
    );
}
