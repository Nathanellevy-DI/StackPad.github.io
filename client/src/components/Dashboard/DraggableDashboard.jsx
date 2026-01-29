/**
 * DraggableDashboard.jsx - Customizable Dashboard Layout
 * 
 * Allows users to drag and reorder widgets on the dashboard.
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

// Default widget configuration
const DEFAULT_WIDGETS = [
    { id: 'timer', title: 'Zen Timer', component: 'ZenTimer' },
    { id: 'commands', title: 'Command Vault', component: 'CommandSearch' },
    { id: 'logs', title: 'System Logs', component: 'SystemLogs' },
    { id: 'slack', title: 'Quick Draft', component: 'SlackDrafter' },
];

// Map component names to actual components
const WIDGET_COMPONENTS = {
    ZenTimer: ZenTimer,
    CommandSearch: CommandSearch,
    SystemLogs: SystemLogs,
    SlackDrafter: SlackDrafter,
};

export default function DraggableDashboard() {
    const workspace = useSelector(selectCurrentWorkspace);
    const workspaceId = workspace?.id || 'default';
    const storageKey = `stackpad_dashboard_layout_${workspaceId}`;

    // Load saved layout or use default
    const [widgets, setWidgets] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return DEFAULT_WIDGETS;
            }
        }
        return DEFAULT_WIDGETS;
    });

    const [isEditMode, setIsEditMode] = useState(false);

    // Save layout to localStorage
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(widgets));
    }, [widgets, storageKey]);

    // Handle drag end
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(widgets);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setWidgets(items);
    };

    // Reset to default layout
    const resetLayout = () => {
        setWidgets(DEFAULT_WIDGETS);
    };

    // Render widget by component name
    const renderWidget = (componentName) => {
        const Component = WIDGET_COMPONENTS[componentName];
        return Component ? <Component /> : null;
    };

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
                        ↺ Reset Layout
                    </button>
                )}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="dashboard" direction="vertical">
                    {(provided, snapshot) => (
                        <div
                            className={`dashboard-grid ${isEditMode ? 'edit-mode' : ''} ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
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
                                            className={`dashboard-section ${widget.id}-section ${snapshot.isDragging ? 'dragging' : ''}`}
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
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
