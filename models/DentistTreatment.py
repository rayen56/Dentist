from odoo import models, fields, api

class Treatment(models.Model):
    _name = 'dentist.treatment'
    _description = 'Tooth Treatment Model'

    name = fields.Char(string='Treatment Name', required=True)
    description = fields.Text(string='Treatment Description', help="Description of the treatment")
    duration = fields.Float(string='Treatment Duration', help="Estimated time in minutes or hours")
    cost = fields.Float(string='Treatment Cost', help="Estimated cost of the treatment")
    notes = fields.Text(string='Treatment Notes', help="Additional information about the treatment")

    tooth_ids = fields.Many2many('dentist.tooth', string='Teeth', widget='image_many2many')

class Tooth(models.Model):
    _name = 'dentist.tooth'
    _description = 'Tooth Model'

    name = fields.Char(string='Tooth Name', required=True)
    image = fields.Binary(string='Tooth Image', help="Image of the tooth")
    position = fields.Char(string='Tooth Position', help="Position information")
    universal_number = fields.Integer(string='Universal Number', help="Universal Numbering System")

    @api.onchange('universal_number')
    def _onchange_universal_number(self):
        # Automatically set the name based on the universal number
        self.name = str(self.universal_number)


# Custom widget for displaying images in Many2many field
class ImageMany2manyWidget(models.AbstractModel):
    _name = 'image.many2many.widget'

    @api.model
    def render_html(self, docids, data=None):
        value = data['value']
        records = self.env[data['model']].browse(docids)
        res = ''
        for record in records:
            res += '''
            <div class="oe_kanban_image oe_kanban_global_click oe_kanban_card_oe_kanban_global_click oe_kanban_standard_scale oe_kanban_record">
                <div class="o_kanban_image">
                    <img class="oe_kanban_image_fill_left" src="data:image/png;base64,%s" alt="%s" />
                </div>
                <div class="oe_kanban_details">
                    <strong>%s</strong>
                </div>
            </div>
            ''' % (record.image.decode('utf-8'), record.name, record.name)
        return res
