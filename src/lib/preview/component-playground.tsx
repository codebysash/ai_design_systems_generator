'use client'

import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GeneratedComponent, DesignSystemConfig } from '@/types'
import { PreviewControls } from './preview-controls'
import { ResponsivePreview } from './responsive-preview'
import { ThemeSwitcher } from './theme-switcher'
import { ThemeProvider } from './theme-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  useVirtualizedComponents,
  useThrottledCallback,
  useDebounced,
  PreviewErrorBoundary,
} from './performance-utils'

// Lazy load ComponentPreview for better initial load performance
const LazyComponentPreview = lazy(() =>
  import('./component-preview').then(module => ({
    default: module.ComponentPreview,
  }))
)

export interface ComponentPlaygroundProps {
  components: GeneratedComponent[]
  designSystem: DesignSystemConfig
  className?: string
  defaultComponent?: string
  showCodePanel?: boolean
  showResponsiveMode?: boolean
  showThemeControls?: boolean
  allowMultipleComponents?: boolean
}

const ComponentPlaygroundImpl: React.FC<ComponentPlaygroundProps> = ({
  components,
  designSystem,
  className,
  defaultComponent,
  showCodePanel = true,
  showResponsiveMode = true,
  showThemeControls = true,
  allowMultipleComponents = false,
}) => {
  const [selectedComponent, setSelectedComponent] =
    useState<GeneratedComponent>(
      () => components.find(c => c.name === defaultComponent) || components[0]
    )
  const [variant, setVariant] = useState<string>(
    selectedComponent?.variants[0]?.name || 'default'
  )
  const [size, setSize] = useState<string>(selectedComponent?.sizes[0] || 'md')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [state, setState] = useState<Record<string, any>>({})
  const [props, setProps] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState('preview')
  const [isResponsiveMode, setIsResponsiveMode] = useState(false)
  const [multipleComponents, setMultipleComponents] = useState<
    GeneratedComponent[]
  >([])
  const [playgroundLayout, setPlaygroundLayout] = useState<
    'horizontal' | 'vertical'
  >('horizontal')

  // Debounce frequently changing values
  const debouncedVariant = useDebounced(variant, 150)
  const debouncedSize = useDebounced(size, 150)
  const debouncedState = useDebounced(state, 200)

  // Reset variant and size when component changes
  useEffect(() => {
    setVariant(selectedComponent?.variants[0]?.name || 'default')
    setSize(selectedComponent?.sizes[0] || 'md')
    setState({})
    setProps({})
  }, [selectedComponent])

  // Throttled handlers for better performance
  const handleComponentChange = useThrottledCallback(
    (componentName: string) => {
      const component = components.find(c => c.name === componentName)
      if (component) {
        setSelectedComponent(component)
      }
    },
    100
  )

  const handleReset = useCallback(() => {
    setVariant(selectedComponent?.variants[0]?.name || 'default')
    setSize(selectedComponent?.sizes[0] || 'md')
    setState({})
    setProps({})
  }, [selectedComponent])

  const handleAddComponent = useCallback(
    (componentName: string) => {
      const component = components.find(c => c.name === componentName)
      if (
        component &&
        !multipleComponents.find(c => c.name === componentName)
      ) {
        setMultipleComponents(prev => [...prev, component])
      }
    },
    [components, multipleComponents]
  )

  const handleRemoveComponent = useCallback((componentName: string) => {
    setMultipleComponents(prev => prev.filter(c => c.name !== componentName))
  }, [])

  // Optimized preview content with lazy loading and error boundaries
  const previewContent = useMemo(() => {
    if (allowMultipleComponents && multipleComponents.length > 0) {
      return (
        <div className="space-y-4">
          {multipleComponents.map(component => (
            <div key={component.name} className="relative">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveComponent(component.name)}
                >
                  Remove
                </Button>
              </div>
              <PreviewErrorBoundary>
                <Suspense fallback={<PreviewLoadingSkeleton />}>
                  <LazyComponentPreview
                    component={component}
                    designSystem={designSystem}
                    theme={theme}
                    variant={component.variants[0]?.name || 'default'}
                    size={component.sizes[0] || 'md'}
                    state={debouncedState}
                    props={props}
                  />
                </Suspense>
              </PreviewErrorBoundary>
            </div>
          ))}
        </div>
      )
    }

    return (
      <PreviewErrorBoundary>
        <Suspense fallback={<PreviewLoadingSkeleton />}>
          <LazyComponentPreview
            component={selectedComponent}
            designSystem={designSystem}
            theme={theme}
            variant={debouncedVariant}
            size={debouncedSize}
            state={debouncedState}
            props={props}
            onVariantChange={setVariant}
            onSizeChange={setSize}
            onStateChange={setState}
            onPropsChange={setProps}
          />
        </Suspense>
      </PreviewErrorBoundary>
    )
  }, [
    selectedComponent,
    designSystem,
    theme,
    debouncedVariant,
    debouncedSize,
    debouncedState,
    props,
    allowMultipleComponents,
    multipleComponents,
    handleRemoveComponent,
  ])

  // Loading skeleton component for better UX
  const PreviewLoadingSkeleton = () => (
    <div className="min-h-[100px] flex items-center justify-center p-4">
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
        <div className="h-8 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  )

  return (
    <ThemeProvider designSystem={designSystem} defaultTheme={theme}>
      <div className={cn('w-full h-screen flex flex-col', className)}>
        {/* Header */}
        <PlaygroundHeader
          components={components}
          selectedComponent={selectedComponent}
          onComponentChange={handleComponentChange}
          isResponsiveMode={isResponsiveMode}
          onResponsiveModeToggle={setIsResponsiveMode}
          showResponsiveMode={showResponsiveMode}
          layout={playgroundLayout}
          onLayoutChange={setPlaygroundLayout}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div
            className={cn(
              'flex-1 flex',
              playgroundLayout === 'horizontal' ? 'flex-row' : 'flex-col'
            )}
          >
            {/* Preview Area */}
            <div className="flex-1 flex flex-col">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="docs">Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="flex-1 overflow-hidden">
                  {isResponsiveMode ? (
                    <ResponsivePreview
                      showRuler={true}
                      showGrid={false}
                      allowCustomSize={true}
                      className="h-full"
                    >
                      {previewContent}
                    </ResponsivePreview>
                  ) : (
                    <div className="h-full p-4 overflow-auto">
                      <div className="min-h-full flex items-center justify-center">
                        {previewContent}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="code" className="flex-1 overflow-hidden">
                  <CodePanel
                    component={selectedComponent}
                    designSystem={designSystem}
                    variant={variant}
                    size={size}
                    state={state}
                    props={props}
                  />
                </TabsContent>

                <TabsContent value="docs" className="flex-1 overflow-hidden">
                  <DocumentationPanel
                    component={selectedComponent}
                    designSystem={designSystem}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Controls Panel */}
            <div
              className={cn(
                'bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700',
                playgroundLayout === 'horizontal' ? 'w-80' : 'h-80'
              )}
            >
              <div className="h-full p-4 overflow-auto">
                <ControlsPanel
                  selectedComponent={selectedComponent}
                  components={components}
                  variant={variant}
                  size={size}
                  theme={theme}
                  state={state}
                  props={props}
                  allowMultipleComponents={allowMultipleComponents}
                  multipleComponents={multipleComponents}
                  showThemeControls={showThemeControls}
                  onVariantChange={setVariant}
                  onSizeChange={setSize}
                  onThemeChange={setTheme}
                  onStateChange={setState}
                  onPropsChange={setProps}
                  onReset={handleReset}
                  onAddComponent={handleAddComponent}
                  onRemoveComponent={handleRemoveComponent}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

interface PlaygroundHeaderProps {
  components: GeneratedComponent[]
  selectedComponent: GeneratedComponent
  onComponentChange: (componentName: string) => void
  isResponsiveMode: boolean
  onResponsiveModeToggle: (enabled: boolean) => void
  showResponsiveMode: boolean
  layout: 'horizontal' | 'vertical'
  onLayoutChange: (layout: 'horizontal' | 'vertical') => void
}

const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({
  components,
  selectedComponent,
  onComponentChange,
  isResponsiveMode,
  onResponsiveModeToggle,
  showResponsiveMode,
  layout,
  onLayoutChange,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Component Playground</h1>
          <Badge variant="outline">{components.length} components</Badge>
        </div>

        <div className="flex items-center space-x-4">
          {showResponsiveMode && (
            <div className="flex items-center space-x-2">
              <Switch
                id="responsive-mode"
                checked={isResponsiveMode}
                onCheckedChange={onResponsiveModeToggle}
              />
              <Label htmlFor="responsive-mode">Responsive</Label>
            </div>
          )}

          <Select value={layout} onValueChange={onLayoutChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ControlsPanelProps {
  selectedComponent: GeneratedComponent
  components: GeneratedComponent[]
  variant: string
  size: string
  theme: 'light' | 'dark'
  state: Record<string, any>
  props: Record<string, any>
  allowMultipleComponents: boolean
  multipleComponents: GeneratedComponent[]
  showThemeControls: boolean
  onVariantChange: (variant: string) => void
  onSizeChange: (size: string) => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onStateChange: (state: Record<string, any>) => void
  onPropsChange: (props: Record<string, any>) => void
  onReset: () => void
  onAddComponent: (componentName: string) => void
  onRemoveComponent: (componentName: string) => void
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  selectedComponent,
  components,
  variant,
  size,
  theme,
  state,
  props,
  allowMultipleComponents,
  multipleComponents,
  showThemeControls,
  onVariantChange,
  onSizeChange,
  onThemeChange,
  onStateChange,
  onPropsChange,
  onReset,
  onAddComponent,
  onRemoveComponent,
}) => {
  return (
    <div className="space-y-4">
      {/* Component Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={selectedComponent.name}
            onValueChange={name => {
              const component = components.find(c => c.name === name)
              if (component) {
                // This would trigger the parent component change
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {components.map(component => (
                <SelectItem key={component.name} value={component.name}>
                  {component.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allowMultipleComponents && (
            <div className="space-y-2">
              <Label className="text-xs">Add Components</Label>
              <Select onValueChange={onAddComponent}>
                <SelectTrigger>
                  <SelectValue placeholder="Add component" />
                </SelectTrigger>
                <SelectContent>
                  {components
                    .filter(
                      c => !multipleComponents.find(mc => mc.name === c.name)
                    )
                    .map(component => (
                      <SelectItem key={component.name} value={component.name}>
                        {component.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Controls */}
      <PreviewControls
        component={selectedComponent}
        variant={variant}
        size={size}
        theme={theme}
        state={state}
        props={props}
        onVariantChange={onVariantChange}
        onSizeChange={onSizeChange}
        onThemeChange={onThemeChange}
        onStateChange={onStateChange}
        onPropsChange={onPropsChange}
        onReset={onReset}
      />

      {/* Theme Controls */}
      {showThemeControls && (
        <ThemeSwitcher showVariants={true} showPresets={true} compact={false} />
      )}
    </div>
  )
}

interface CodePanelProps {
  component: GeneratedComponent
  designSystem: DesignSystemConfig
  variant: string
  size: string
  state: Record<string, any>
  props: Record<string, any>
}

const CodePanel: React.FC<CodePanelProps> = ({
  component,
  designSystem,
  variant,
  size,
  state,
  props,
}) => {
  const [codeType, setCodeType] = useState<'tsx' | 'css' | 'tokens'>('tsx')
  const [generatedCode, setGeneratedCode] = useState('')

  useEffect(() => {
    // Generate code based on current settings
    const generateCode = () => {
      switch (codeType) {
        case 'tsx':
          return generateTSXCode(component, variant, size, state, props)
        case 'css':
          return generateCSSCode(component, designSystem)
        case 'tokens':
          return generateTokensCode(designSystem)
        default:
          return ''
      }
    }

    setGeneratedCode(generateCode())
  }, [component, designSystem, variant, size, state, props, codeType])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Label>Code Type:</Label>
          <Select
            value={codeType}
            onValueChange={(value: 'css' | 'tsx' | 'tokens') =>
              setCodeType(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tsx">TSX</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="tokens">Tokens</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          Copy
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
          <code>{generatedCode}</code>
        </pre>
      </div>
    </div>
  )
}

interface DocumentationPanelProps {
  component: GeneratedComponent
  designSystem: DesignSystemConfig
}

const DocumentationPanel: React.FC<DocumentationPanelProps> = ({
  component,
  designSystem,
}) => {
  return (
    <div className="h-full overflow-auto p-4">
      <div className="max-w-none prose prose-sm">
        <h2>{component.name}</h2>
        <p>{component.description}</p>

        <h3>Props</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Type</th>
              <th className="border border-gray-300 p-2 text-left">Required</th>
              <th className="border border-gray-300 p-2 text-left">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {component.props.map(prop => (
              <tr key={prop.name}>
                <td className="border border-gray-300 p-2 font-mono">
                  {prop.name}
                </td>
                <td className="border border-gray-300 p-2 font-mono">
                  {prop.type}
                </td>
                <td className="border border-gray-300 p-2">
                  {prop.required ? 'Yes' : 'No'}
                </td>
                <td className="border border-gray-300 p-2">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Variants</h3>
        <ul>
          {component.variants.map(variant => (
            <li key={variant.name}>
              <strong>{variant.name}</strong>: {variant.description}
            </li>
          ))}
        </ul>

        <h3>Accessibility</h3>
        <ul>
          {component.accessibility.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Helper functions for code generation
const generateTSXCode = (
  component: GeneratedComponent,
  variant: string,
  size: string,
  state: Record<string, any>,
  props: Record<string, any>
): string => {
  const propsString = Object.entries({ variant, size, ...state, ...props })
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : `${key}={false}`
      }
      if (typeof value === 'string') {
        return `${key}="${value}"`
      }
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')

  return `<${component.name}${propsString ? ' ' + propsString : ''}>
  ${component.name === 'Button' ? 'Button text' : ''}
</${component.name}>`
}

const generateCSSCode = (
  component: GeneratedComponent,
  designSystem: DesignSystemConfig
): string => {
  return `/* ${component.name} Component Styles */
.${component.name.toLowerCase()} {
  /* Base styles */
  font-family: ${designSystem.typography.bodyFont};
  border-radius: ${designSystem.borderRadius.md};
  transition: all 0.2s ease;
}

/* Variants */
${component.variants
  .map(
    variant => `
.${component.name.toLowerCase()}--${variant.name} {
  /* ${variant.description} */
}
`
  )
  .join('')}

/* Sizes */
${component.sizes
  .map(
    size => `
.${component.name.toLowerCase()}--${size} {
  /* ${size} size styles */
}
`
  )
  .join('')}`
}

const generateTokensCode = (designSystem: DesignSystemConfig): string => {
  return JSON.stringify(
    {
      colors: designSystem.colors,
      typography: designSystem.typography,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
    },
    null,
    2
  )
}

// Memoized ComponentPlayground for better performance
export const ComponentPlayground = memo(
  ComponentPlaygroundImpl,
  (prevProps, nextProps) => {
    return (
      prevProps.components.length === nextProps.components.length &&
      prevProps.components.every(
        (comp, index) => comp.name === nextProps.components[index]?.name
      ) &&
      JSON.stringify(prevProps.designSystem.colors) ===
        JSON.stringify(nextProps.designSystem.colors) &&
      JSON.stringify(prevProps.designSystem.typography) ===
        JSON.stringify(nextProps.designSystem.typography) &&
      prevProps.defaultComponent === nextProps.defaultComponent
    )
  }
)

export default ComponentPlayground
