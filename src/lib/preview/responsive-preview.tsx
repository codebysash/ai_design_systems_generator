'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface ResponsivePreviewProps {
  children: React.ReactNode
  className?: string
  defaultDevice?: string
  showRuler?: boolean
  showGrid?: boolean
  allowCustomSize?: boolean
  onDeviceChange?: (device: DeviceConfig) => void
  onSizeChange?: (width: number, height: number) => void
}

export interface DeviceConfig {
  name: string
  width: number
  height: number
  category: 'mobile' | 'tablet' | 'desktop' | 'custom'
  icon: string
  userAgent?: string
  pixelRatio?: number
}

const DEVICE_PRESETS: DeviceConfig[] = [
  // Mobile devices
  { name: 'iPhone SE', width: 375, height: 667, category: 'mobile', icon: '📱', pixelRatio: 2 },
  { name: 'iPhone 12', width: 390, height: 844, category: 'mobile', icon: '📱', pixelRatio: 3 },
  { name: 'iPhone 14 Pro', width: 393, height: 852, category: 'mobile', icon: '📱', pixelRatio: 3 },
  { name: 'Samsung Galaxy S21', width: 384, height: 854, category: 'mobile', icon: '📱', pixelRatio: 3 },
  { name: 'Google Pixel 5', width: 393, height: 851, category: 'mobile', icon: '📱', pixelRatio: 2.75 },
  
  // Tablets
  { name: 'iPad', width: 768, height: 1024, category: 'tablet', icon: '📱', pixelRatio: 2 },
  { name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet', icon: '📱', pixelRatio: 2 },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet', icon: '📱', pixelRatio: 2 },
  { name: 'Surface Pro', width: 912, height: 1368, category: 'tablet', icon: '📱', pixelRatio: 2 },
  
  // Desktop
  { name: 'Small Desktop', width: 1024, height: 768, category: 'desktop', icon: '💻', pixelRatio: 1 },
  { name: 'Medium Desktop', width: 1440, height: 900, category: 'desktop', icon: '💻', pixelRatio: 1 },
  { name: 'Large Desktop', width: 1920, height: 1080, category: 'desktop', icon: '💻', pixelRatio: 1 },
  { name: 'Ultra-wide', width: 2560, height: 1440, category: 'desktop', icon: '💻', pixelRatio: 1 },
  
  // Common breakpoints
  { name: 'Mobile (360px)', width: 360, height: 640, category: 'mobile', icon: '📱' },
  { name: 'Tablet (768px)', width: 768, height: 1024, category: 'tablet', icon: '📱' },
  { name: 'Desktop (1024px)', width: 1024, height: 768, category: 'desktop', icon: '💻' },
  { name: 'Large (1280px)', width: 1280, height: 800, category: 'desktop', icon: '💻' },
  { name: 'XL (1536px)', width: 1536, height: 864, category: 'desktop', icon: '💻' }
]

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  children,
  className,
  defaultDevice = 'Medium Desktop',
  showRuler = true,
  showGrid = false,
  allowCustomSize = true,
  onDeviceChange,
  onSizeChange
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(
    DEVICE_PRESETS.find(d => d.name === defaultDevice) || DEVICE_PRESETS[0]
  )
  const [customWidth, setCustomWidth] = useState(selectedDevice.width)
  const [customHeight, setCustomHeight] = useState(selectedDevice.height)
  const [isCustomSize, setIsCustomSize] = useState(false)
  const [showRulerState, setShowRulerState] = useState(showRuler)
  const [showGridState, setShowGridState] = useState(showGrid)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [zoom, setZoom] = useState(1)
  const [isResizing, setIsResizing] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const currentWidth = isCustomSize ? customWidth : selectedDevice.width
  const currentHeight = isCustomSize ? customHeight : selectedDevice.height

  useEffect(() => {
    onDeviceChange?.(selectedDevice)
    onSizeChange?.(currentWidth, currentHeight)
  }, [selectedDevice, currentWidth, currentHeight, onDeviceChange, onSizeChange])

  const handleDeviceChange = (deviceName: string) => {
    const device = DEVICE_PRESETS.find(d => d.name === deviceName)
    if (device) {
      setSelectedDevice(device)
      setCustomWidth(device.width)
      setCustomHeight(device.height)
      setIsCustomSize(false)
    }
  }

  const handleCustomSize = () => {
    setIsCustomSize(true)
    setSelectedDevice({
      name: 'Custom',
      width: customWidth,
      height: customHeight,
      category: 'custom',
      icon: '🔧'
    })
  }

  const handleOrientationToggle = () => {
    const newOrientation = orientation === 'portrait' ? 'landscape' : 'portrait'
    setOrientation(newOrientation)
    
    if (newOrientation === 'landscape') {
      setCustomWidth(currentHeight)
      setCustomHeight(currentWidth)
    } else {
      setCustomWidth(currentHeight)
      setCustomHeight(currentWidth)
    }
  }

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.25, Math.min(2, newZoom)))
  }

  const getDeviceByCategory = (category: string) => {
    return DEVICE_PRESETS.filter(d => d.category === category)
  }

  const actualWidth = orientation === 'landscape' ? currentHeight : currentWidth
  const actualHeight = orientation === 'landscape' ? currentWidth : currentHeight

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Controls */}
      <ResponsiveControls
        selectedDevice={selectedDevice}
        devices={DEVICE_PRESETS}
        customWidth={customWidth}
        customHeight={customHeight}
        isCustomSize={isCustomSize}
        allowCustomSize={allowCustomSize}
        showRuler={showRulerState}
        showGrid={showGridState}
        orientation={orientation}
        zoom={zoom}
        onDeviceChange={handleDeviceChange}
        onCustomWidthChange={setCustomWidth}
        onCustomHeightChange={setCustomHeight}
        onCustomSizeToggle={handleCustomSize}
        onRulerToggle={setShowRulerState}
        onGridToggle={setShowGridState}
        onOrientationToggle={handleOrientationToggle}
        onZoomChange={handleZoomChange}
      />

      {/* Preview Container */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-auto border rounded-lg bg-gray-50 dark:bg-gray-900"
        style={{ 
          minHeight: Math.max(400, actualHeight * zoom + 100),
          background: showGridState ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : undefined,
          backgroundSize: showGridState ? '20px 20px' : undefined
        }}
      >
        {/* Ruler */}
        {showRulerState && (
          <Ruler 
            width={actualWidth} 
            height={actualHeight} 
            zoom={zoom}
          />
        )}

        {/* Device Frame */}
        <div className="flex items-center justify-center min-h-full p-8">
          <motion.div
            layout
            ref={previewRef}
            className="relative bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border"
            style={{
              width: actualWidth * zoom,
              height: actualHeight * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Device Info */}
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="outline" className="text-xs bg-white/90 dark:bg-gray-800/90">
                {selectedDevice.name} - {actualWidth}×{actualHeight}
              </Badge>
            </div>

            {/* Content */}
            <div 
              className="w-full h-full overflow-auto"
              style={{
                transform: `scale(${1/zoom})`,
                transformOrigin: 'top left',
                width: `${100 * zoom}%`,
                height: `${100 * zoom}%`
              }}
            >
              {children}
            </div>

            {/* Resize Handle */}
            {isCustomSize && (
              <ResizeHandle
                onResize={(deltaX, deltaY) => {
                  setCustomWidth(prev => Math.max(320, prev + deltaX / zoom))
                  setCustomHeight(prev => Math.max(240, prev + deltaY / zoom))
                }}
                onResizeStart={() => setIsResizing(true)}
                onResizeEnd={() => setIsResizing(false)}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface ResponsiveControlsProps {
  selectedDevice: DeviceConfig
  devices: DeviceConfig[]
  customWidth: number
  customHeight: number
  isCustomSize: boolean
  allowCustomSize: boolean
  showRuler: boolean
  showGrid: boolean
  orientation: 'portrait' | 'landscape'
  zoom: number
  onDeviceChange: (deviceName: string) => void
  onCustomWidthChange: (width: number) => void
  onCustomHeightChange: (height: number) => void
  onCustomSizeToggle: () => void
  onRulerToggle: (show: boolean) => void
  onGridToggle: (show: boolean) => void
  onOrientationToggle: () => void
  onZoomChange: (zoom: number) => void
}

const ResponsiveControls: React.FC<ResponsiveControlsProps> = ({
  selectedDevice,
  devices,
  customWidth,
  customHeight,
  isCustomSize,
  allowCustomSize,
  showRuler,
  showGrid,
  orientation,
  zoom,
  onDeviceChange,
  onCustomWidthChange,
  onCustomHeightChange,
  onCustomSizeToggle,
  onRulerToggle,
  onGridToggle,
  onOrientationToggle,
  onZoomChange
}) => {
  const devicesByCategory = {
    mobile: devices.filter(d => d.category === 'mobile'),
    tablet: devices.filter(d => d.category === 'tablet'),
    desktop: devices.filter(d => d.category === 'desktop')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Responsive Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Device Selection */}
          <div className="space-y-2">
            <Label>Device</Label>
            <Select value={selectedDevice.name} onValueChange={onDeviceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Custom">🔧 Custom Size</SelectItem>
                {Object.entries(devicesByCategory).map(([category, categoryDevices]) => (
                  <React.Fragment key={category}>
                    {categoryDevices.map((device) => (
                      <SelectItem key={device.name} value={device.name}>
                        {device.icon} {device.name} ({device.width}×{device.height})
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Dimensions */}
          {(isCustomSize || allowCustomSize) && (
            <div className="space-y-2">
              <Label>Dimensions</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Width"
                  value={customWidth}
                  onChange={(e) => onCustomWidthChange(Number(e.target.value))}
                  min="320"
                  max="3840"
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={customHeight}
                  onChange={(e) => onCustomHeightChange(Number(e.target.value))}
                  min="240"
                  max="2160"
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Zoom Control */}
          <div className="space-y-2">
            <Label>Zoom ({Math.round(zoom * 100)}%)</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onZoomChange(zoom - 0.25)}
                disabled={zoom <= 0.25}
              >
                -
              </Button>
              <Input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onZoomChange(zoom + 0.25)}
                disabled={zoom >= 2}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="orientation"
              checked={orientation === 'landscape'}
              onCheckedChange={onOrientationToggle}
            />
            <Label htmlFor="orientation">Landscape</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ruler"
              checked={showRuler}
              onCheckedChange={onRulerToggle}
            />
            <Label htmlFor="ruler">Ruler</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="grid"
              checked={showGrid}
              onCheckedChange={onGridToggle}
            />
            <Label htmlFor="grid">Grid</Label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(1)}
          >
            Reset Zoom
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface RulerProps {
  width: number
  height: number
  zoom: number
}

const Ruler: React.FC<RulerProps> = ({ width, height, zoom }) => {
  return (
    <>
      {/* Horizontal Ruler */}
      <div 
        className="absolute top-0 left-0 h-6 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex items-end"
        style={{ width: width * zoom }}
      >
        {Array.from({ length: Math.floor(width / 100) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute bottom-0 border-l border-gray-400 dark:border-gray-500"
            style={{ left: i * 100 * zoom }}
          >
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
              {i * 100}
            </span>
          </div>
        ))}
      </div>

      {/* Vertical Ruler */}
      <div 
        className="absolute top-0 left-0 w-6 bg-gray-200 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600"
        style={{ height: height * zoom }}
      >
        {Array.from({ length: Math.floor(height / 100) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 border-t border-gray-400 dark:border-gray-500"
            style={{ top: i * 100 * zoom }}
          >
            <span 
              className="text-xs text-gray-600 dark:text-gray-400 ml-1"
              style={{ 
                transform: 'rotate(-90deg)',
                transformOrigin: 'left center',
                position: 'absolute',
                left: 2,
                top: 10
              }}
            >
              {i * 100}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

interface ResizeHandleProps {
  onResize: (deltaX: number, deltaY: number) => void
  onResizeStart: () => void
  onResizeEnd: () => void
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize, onResizeStart, onResizeEnd }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    onResizeStart()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    onResize(deltaX, deltaY)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    onResizeEnd()
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  return (
    <div
      className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nw-resize hover:bg-blue-600 opacity-50 hover:opacity-100 transition-opacity"
      onMouseDown={handleMouseDown}
    />
  )
}

export default ResponsivePreview