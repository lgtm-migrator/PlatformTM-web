﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace eTRIKSService.Models
{
    public class eTRIKSModel
    {
    }

    public class DerivedVariable
    { 
    }

    // Non SQL Model
    public class RecordList
    {
        public List<Record> records = new List<Record>();
    }

    public class Record
    {
        public List<RecordItem> recordItems = new List<RecordItem>();
    }

    public class RecordItem
    {
        public string fieldName { get; set; }
        public string value { get; set; }
    }

}