{
    'name': 'Dentist Management',
    'version': '1.0',
    'category': 'Health',
    'summary': 'Manage Dentist Appointments',
    'author': 'Your Name',
    'depends': ['mail', 'base'],
    'data': [
        'views/patient_view.xml',
        'security/ir.model.access.csv',
        'views/appointment_view.xml',
        'Data/sequence.xml',
        'Data/procedure_data.xml',
        'views/dentist_treatment_view.xml',
        'views/teeth_view.xml',
        'views/assets.xml',
        'views/procedure_view.xml',
        'views/treatment_data_view.xml',
        'views/dashboard_view.xml',
    ],
    'qweb': ['static/src/xml/*.xml'],
    'assets': {
        'web.assets_backend': [
            'Dentist/static/src/css/all.min.css',
        ],
    },
    'installable': True,
    'application': True,
}
