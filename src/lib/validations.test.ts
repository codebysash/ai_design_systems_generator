import { 
  designSystemSchema,
  type DesignSystemFormData 
} from './validations'

describe('Design System Form Validation', () => {
  describe('designSystemSchema', () => {
    const validFormData: DesignSystemFormData = {
      name: 'Modern E-commerce System',
      description: 'Modern e-commerce design system for online retail',
      style: 'modern',
      primaryColor: '#3B82F6',
      industry: 'e-commerce',
      components: ['Button', 'Input', 'Card']
    }

    it('should validate correct form data', () => {
      const result = designSystemSchema.safeParse(validFormData)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validFormData)
      }
    })

    describe('validation rules', () => {
      it('should require name', () => {
        const result = designSystemSchema.safeParse({
          ...validFormData,
          name: ''
        })

        expect(result.success).toBe(false)
      })

      it('should require description with minimum length', () => {
        const result = designSystemSchema.safeParse({
          ...validFormData,
          description: 'short'
        })

        expect(result.success).toBe(false)
      })

      it('should validate hex color format', () => {
        const validResult = designSystemSchema.safeParse({
          ...validFormData,
          primaryColor: '#FF0000'
        })
        expect(validResult.success).toBe(true)

        const invalidResult = designSystemSchema.safeParse({
          ...validFormData,
          primaryColor: 'red'
        })
        expect(invalidResult.success).toBe(false)
      })

      it('should accept valid style options', () => {
        const validStyles = ['modern', 'classic', 'playful', 'minimal', 'bold']
        
        validStyles.forEach(style => {
          const result = designSystemSchema.safeParse({
            ...validFormData,
            style: style as any
          })
          expect(result.success).toBe(true)
        })
      })

      it('should reject invalid style options', () => {
        const result = designSystemSchema.safeParse({
          ...validFormData,
          style: 'invalid-style' as any
        })

        expect(result.success).toBe(false)
      })

      it('should allow optional fields', () => {
        const result = designSystemSchema.safeParse({
          name: 'Test System',
          description: 'A test design system with minimum required fields',
          style: 'modern',
          primaryColor: '#3B82F6'
        })

        expect(result.success).toBe(true)
      })
    })
  })
})